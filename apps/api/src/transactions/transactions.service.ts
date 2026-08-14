import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountVisibility, AuditAction, MembershipStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceContext } from '../common/auth.types';
import { CreateTransactionDto, UpdateTransactionDto } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(context: WorkspaceContext, query: { cursor?: string; limit?: number; type?: TransactionType; categoryId?: string; memberId?: string; from?: string; to?: string }) {
    const limit = Math.min(Math.max(query.limit || 25, 1), 100);
    const rows = await this.prisma.transaction.findMany({
      where: { workspaceId: context.workspaceId, deletedAt: null, ...(query.type ? { type: query.type } : {}), ...(query.categoryId ? { categoryId: query.categoryId } : {}), ...(query.memberId ? { createdByMembershipId: query.memberId } : {}), ...(query.from || query.to ? { occurredAt: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } } : {}) },
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      include: { category: { select: { id: true, name: true, icon: true } }, sourceAccount: { select: { id: true, name: true } }, destinationAccount: { select: { id: true, name: true } }, createdByMembership: { include: { user: { select: { firstName: true, lastName: true } } } }, paidByMembership: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit).map((row) => this.serialize(row));
    return { data, meta: { nextCursor: hasMore ? data[data.length - 1]?.id : null, limit } };
  }

  async create(context: WorkspaceContext, userId: string, dto: CreateTransactionDto) {
    const amount = BigInt(dto.amountMinor);
    if (amount <= 0n) throw new BadRequestException('amountMinor must be positive');
    const transaction = await this.prisma.$transaction(async (tx) => {
      const account = dto.accountId ? await this.assertAccount(tx, context, dto.accountId) : null;
      if (dto.type !== TransactionType.TRANSFER && !account) throw new BadRequestException('An account is required');
      if (dto.type === TransactionType.TRANSFER && (!account || !dto.destinationAccountId)) throw new BadRequestException('Transfers require source and destination accounts');
      if (dto.type === TransactionType.TRANSFER && dto.accountId === dto.destinationAccountId) throw new BadRequestException('Transfer accounts must be different');
      const destination = dto.destinationAccountId ? await this.assertAccount(tx, context, dto.destinationAccountId) : null;
      if (account && destination && account.currency !== destination.currency) throw new BadRequestException('Cross-currency transfers are not supported');
      const category = dto.categoryId ? await tx.category.findFirst({ where: { id: dto.categoryId, workspaceId: context.workspaceId, isActive: true } }) : null;
      if (dto.categoryId && !category) throw new BadRequestException('Category is not active or does not belong to this workspace');
      if (dto.type === TransactionType.TRANSFER && dto.categoryId) throw new BadRequestException('Transfers cannot have a category');
      const paidBy = dto.paidByMembershipId ? await tx.workspaceMembership.findFirst({ where: { id: dto.paidByMembershipId, workspaceId: context.workspaceId, status: MembershipStatus.ACTIVE } }) : null;
      if (dto.paidByMembershipId && !paidBy) throw new BadRequestException('Payer does not belong to this workspace');
      const created = await tx.transaction.create({ data: { workspaceId: context.workspaceId, type: dto.type, amountMinor: amount, currency: dto.currency.toUpperCase(), categoryId: category?.id, accountId: account?.id, destinationAccountId: destination?.id, createdByMembershipId: context.membershipId, paidByMembershipId: paidBy?.id || context.membershipId, occurredAt: new Date(dto.occurredAt), description: dto.description.trim(), notes: dto.notes?.trim() } });
      const movements = this.movementData(created.id, context.workspaceId, created.occurredAt, dto.type, account?.id, destination?.id, amount);
      for (const movement of movements) await tx.accountMovement.create({ data: movement });
      for (const movement of movements) await tx.account.update({ where: { id: movement.accountId }, data: { currentBalanceMinor: { increment: movement.movementType === 'CREDIT' ? amount : -amount } } });
      return created;
    });
    await this.audit.record({ action: AuditAction.CREATE, entityType: 'Transaction', entityId: transaction.id, workspaceId: context.workspaceId, actorUserId: userId, metadata: { type: transaction.type } });
    return this.getOne(context, transaction.id);
  }

  async update(context: WorkspaceContext, userId: string, id: string, dto: UpdateTransactionDto) {
    const current = await this.prisma.transaction.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null } });
    if (!current) throw new NotFoundException('Transaction not found');
    if (current.createdByMembershipId !== context.membershipId && !['OWNER', 'ADMIN'].includes(context.role)) throw new ForbiddenException('You can only edit your own transaction');
    if (dto.categoryId) { const category = await this.prisma.category.findFirst({ where: { id: dto.categoryId, workspaceId: context.workspaceId, isActive: true } }); if (!category) throw new BadRequestException('Category is not active or does not belong to this workspace'); }
    const updated = await this.prisma.transaction.update({ where: { id }, data: { description: dto.description?.trim(), notes: dto.notes?.trim(), occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined, categoryId: dto.categoryId } });
    await this.audit.record({ action: AuditAction.UPDATE, entityType: 'Transaction', entityId: id, workspaceId: context.workspaceId, actorUserId: userId });
    return this.getOne(context, updated.id);
  }

  async remove(context: WorkspaceContext, userId: string, id: string) {
    const current = await this.prisma.transaction.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null }, include: { movements: true } });
    if (!current) throw new NotFoundException('Transaction not found');
    if (current.createdByMembershipId !== context.membershipId && !['OWNER', 'ADMIN'].includes(context.role)) throw new ForbiddenException('You can only delete your own transaction');
    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({ where: { id }, data: { deletedAt: new Date(), deletedByUserId: userId, deletedByMembershipId: context.membershipId } });
      for (const movement of current.movements) await tx.account.update({ where: { id: movement.accountId }, data: { currentBalanceMinor: { increment: movement.movementType === 'CREDIT' ? -movement.amountMinor : movement.amountMinor } } });
    });
    await this.audit.record({ action: AuditAction.DELETE, entityType: 'Transaction', entityId: id, workspaceId: context.workspaceId, actorUserId: userId });
    return { id, deleted: true };
  }

  private async getOne(context: WorkspaceContext, id: string) { const row = await this.prisma.transaction.findFirst({ where: { id, workspaceId: context.workspaceId, deletedAt: null }, include: { category: true, sourceAccount: true, destinationAccount: true, createdByMembership: { include: { user: { select: { firstName: true, lastName: true } } } }, paidByMembership: { include: { user: { select: { firstName: true, lastName: true } } } } } }); if (!row) throw new NotFoundException('Transaction not found'); return this.serialize(row); }

  private async assertAccount(tx: Pick<PrismaService, 'account'>, context: WorkspaceContext, id: string) { const account = await tx.account.findFirst({ where: { id, workspaceId: context.workspaceId, isActive: true, OR: [{ visibility: AccountVisibility.SHARED }, { ownerMembershipId: context.membershipId }] } }); if (!account) throw new BadRequestException('Account is not available'); return account; }
  private movementData(transactionId: string, workspaceId: string, occurredAt: Date, type: TransactionType, sourceId: string | undefined, destinationId: string | undefined, amount: bigint) { if (type === TransactionType.TRANSFER) return [{ transactionId, workspaceId, accountId: sourceId!, movementType: 'DEBIT' as const, amountMinor: amount, occurredAt }, { transactionId, workspaceId, accountId: destinationId!, movementType: 'CREDIT' as const, amountMinor: amount, occurredAt }]; if (type === TransactionType.EXPENSE) return [{ transactionId, workspaceId, accountId: sourceId!, movementType: 'DEBIT' as const, amountMinor: amount, occurredAt }]; return [{ transactionId, workspaceId, accountId: sourceId!, movementType: 'CREDIT' as const, amountMinor: amount, occurredAt }]; }
  private serialize(row: any) { return { ...row, amountMinor: row.amountMinor.toString(), movements: undefined, createdBy: row.createdByMembership ? `${row.createdByMembership.user.firstName} ${row.createdByMembership.user.lastName}` : undefined, paidBy: row.paidByMembership ? `${row.paidByMembership.user.firstName} ${row.paidByMembership.user.lastName}` : undefined }; }
}
