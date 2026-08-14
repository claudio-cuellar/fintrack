import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditAction, BudgetScope, TransactionType } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceContext } from '../common/auth.types';
import { CreateBudgetDto } from './budgets.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async list(context: WorkspaceContext) {
    const budgets = await this.prisma.budget.findMany({ where: { workspaceId: context.workspaceId }, include: { category: { select: { name: true } } }, orderBy: { periodStart: 'desc' } });
    return Promise.all(budgets.map(async (budget) => ({ ...budget, amountMinor: budget.amountMinor.toString(), spentMinor: (await this.spent(context, budget.categoryId, budget.periodStart, budget.periodEnd, budget.ownerMembershipId)).toString() })));
  }
  async create(context: WorkspaceContext, userId: string, dto: CreateBudgetDto) {
    const amount = BigInt(dto.amountMinor);
    if (amount <= 0n) throw new BadRequestException('Budget amount must be positive');
    if (dto.scope === BudgetScope.CATEGORY && !dto.categoryId) throw new BadRequestException('Category budgets require a category');
    if (dto.scope === BudgetScope.PERSONAL && !dto.ownerMembershipId) throw new BadRequestException('Personal budgets require an owner');
    const budget = await this.prisma.budget.create({ data: { workspaceId: context.workspaceId, scope: dto.scope, ownerMembershipId: dto.scope === BudgetScope.PERSONAL ? (dto.ownerMembershipId || context.membershipId) : null, categoryId: dto.categoryId, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd), amountMinor: amount, currency: dto.currency.toUpperCase() } });
    await this.audit.record({ action: AuditAction.CREATE, entityType: 'Budget', entityId: budget.id, workspaceId: context.workspaceId, actorUserId: userId });
    return { ...budget, amountMinor: budget.amountMinor.toString(), spentMinor: '0' };
  }
  private async spent(context: WorkspaceContext, categoryId: string | null, from: Date, to: Date, ownerMembershipId: string | null) { const result = await this.prisma.transaction.aggregate({ where: { workspaceId: context.workspaceId, type: TransactionType.EXPENSE, deletedAt: null, occurredAt: { gte: from, lte: to }, ...(categoryId ? { categoryId } : {}), ...(ownerMembershipId ? { createdByMembershipId: ownerMembershipId } : {}) }, _sum: { amountMinor: true } }); return result._sum.amountMinor || 0n; }
}
