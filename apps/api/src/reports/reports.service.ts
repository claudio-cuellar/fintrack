import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { WorkspaceContext } from '../common/auth.types';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(context: WorkspaceContext, from?: string, to?: string) {
    const start = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const where = { workspaceId: context.workspaceId, deletedAt: null, occurredAt: { gte: start, lte: end } };
    const [income, expenses, byCategory, byMember, recent] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { ...where, type: TransactionType.INCOME }, _sum: { amountMinor: true } }),
      this.prisma.transaction.aggregate({ where: { ...where, type: TransactionType.EXPENSE }, _sum: { amountMinor: true } }),
      this.prisma.transaction.groupBy({ by: ['categoryId'], where: { ...where, type: TransactionType.EXPENSE }, _sum: { amountMinor: true }, orderBy: { _sum: { amountMinor: 'desc' } } }),
      this.prisma.transaction.groupBy({ by: ['createdByMembershipId'], where: { ...where, type: TransactionType.EXPENSE }, _sum: { amountMinor: true }, orderBy: { _sum: { amountMinor: 'desc' } } }),
      this.prisma.transaction.findMany({ where, orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], take: 8, include: { category: { select: { name: true } }, createdByMembership: { include: { user: { select: { firstName: true, lastName: true } } } } } }),
    ]);
    const incomeMinor = income._sum.amountMinor || 0n;
    const expenseMinor = expenses._sum.amountMinor || 0n;
    const categoryIds = byCategory.map((row) => row.categoryId).filter((id): id is string => Boolean(id));
    const memberIds = byMember.map((row) => row.createdByMembershipId);
    const [categories, members] = await Promise.all([
      this.prisma.category.findMany({ where: { id: { in: categoryIds }, workspaceId: context.workspaceId }, select: { id: true, name: true } }),
      this.prisma.workspaceMembership.findMany({ where: { id: { in: memberIds }, workspaceId: context.workspaceId }, include: { user: { select: { firstName: true, lastName: true } } } }),
    ]);
    const categoryName = new Map(categories.map((row) => [row.id, row.name]));
    const memberName = new Map(members.map((row) => [row.id, `${row.user.firstName} ${row.user.lastName}`]));
    return { period: { from: start.toISOString(), to: end.toISOString() }, totals: { incomeMinor: incomeMinor.toString(), expenseMinor: expenseMinor.toString(), netMinor: (incomeMinor - expenseMinor).toString() }, spendingByCategory: byCategory.map((row) => ({ categoryId: row.categoryId, name: row.categoryId ? categoryName.get(row.categoryId) : 'Uncategorized', amountMinor: (row._sum.amountMinor || 0n).toString() })), spendingByMember: byMember.map((row) => ({ memberId: row.createdByMembershipId, name: memberName.get(row.createdByMembershipId) || 'Unknown', amountMinor: (row._sum.amountMinor || 0n).toString() })), recentTransactions: recent.map((row) => ({ id: row.id, type: row.type, amountMinor: row.amountMinor.toString(), description: row.description, occurredAt: row.occurredAt, category: row.category?.name, createdBy: `${row.createdByMembership.user.firstName} ${row.createdByMembership.user.lastName}` })) };
  }
}
