import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountVisibility, AuditAction } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceContext } from '../common/auth.types';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  list(context: WorkspaceContext) { return this.prisma.account.findMany({ where: { workspaceId: context.workspaceId, isActive: true, OR: [{ visibility: AccountVisibility.SHARED }, { ownerMembershipId: context.membershipId }] }, orderBy: { name: 'asc' } }); }
  async create(context: WorkspaceContext, userId: string, dto: CreateAccountDto) {
    if (dto.visibility === AccountVisibility.PERSONAL && dto.ownerMembershipId && dto.ownerMembershipId !== context.membershipId) throw new ForbiddenException('A personal account must belong to the current member');
    const account = await this.prisma.account.create({ data: { workspaceId: context.workspaceId, name: dto.name.trim(), type: dto.type, visibility: dto.visibility, currency: dto.currency.toUpperCase(), initialBalanceMinor: BigInt(dto.initialBalanceMinor || 0), currentBalanceMinor: BigInt(dto.initialBalanceMinor || 0), ownerMembershipId: dto.visibility === AccountVisibility.PERSONAL ? (dto.ownerMembershipId || context.membershipId) : null } });
    await this.audit.record({ action: AuditAction.CREATE, entityType: 'Account', entityId: account.id, workspaceId: context.workspaceId, actorUserId: userId });
    return this.serialize(account);
  }
  async update(context: WorkspaceContext, userId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.assertVisible(context, id);
    if (account.visibility === AccountVisibility.PERSONAL && account.ownerMembershipId !== context.membershipId) throw new ForbiddenException('Only the account owner can update a personal account');
    const updated = await this.prisma.account.update({ where: { id }, data: dto });
    await this.audit.record({ action: AuditAction.UPDATE, entityType: 'Account', entityId: id, workspaceId: context.workspaceId, actorUserId: userId });
    return this.serialize(updated);
  }
  private async assertVisible(context: WorkspaceContext, id: string) { const account = await this.prisma.account.findFirst({ where: { id, workspaceId: context.workspaceId, isActive: true, OR: [{ visibility: AccountVisibility.SHARED }, { ownerMembershipId: context.membershipId }] } }); if (!account) throw new NotFoundException('Account not found'); return account; }
  private serialize<T extends { initialBalanceMinor: bigint; currentBalanceMinor: bigint }>(account: T) { return { ...account, initialBalanceMinor: account.initialBalanceMinor.toString(), currentBalanceMinor: account.currentBalanceMinor.toString() }; }
}
