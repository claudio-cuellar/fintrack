import { MembershipRole } from '@prisma/client';

export const Permission = {
  WorkspaceRead: 'workspace.read',
  WorkspaceManage: 'workspace.manage',
  MembersManage: 'members.manage',
  TransactionsRead: 'transactions.read',
  TransactionsCreate: 'transactions.create',
  TransactionsManageAny: 'transactions.manage.any',
  TransactionsManageOwn: 'transactions.manage.own',
  CategoriesManage: 'categories.manage',
  AccountsManage: 'accounts.manage',
  BudgetsManage: 'budgets.manage',
  ReportsRead: 'reports.read',
  AuditRead: 'audit.read',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

const rolePermissions: Record<MembershipRole, ReadonlySet<PermissionKey>> = {
  OWNER: new Set(Object.values(Permission)),
  ADMIN: new Set([
    Permission.WorkspaceRead, Permission.MembersManage, Permission.TransactionsRead,
    Permission.TransactionsCreate, Permission.TransactionsManageAny, Permission.CategoriesManage,
    Permission.AccountsManage, Permission.BudgetsManage, Permission.ReportsRead, Permission.AuditRead,
  ]),
  MEMBER: new Set([
    Permission.WorkspaceRead, Permission.TransactionsRead, Permission.TransactionsCreate,
    Permission.TransactionsManageOwn, Permission.ReportsRead,
  ]),
  VIEWER: new Set([Permission.WorkspaceRead, Permission.TransactionsRead, Permission.ReportsRead]),
};

export function roleHasPermission(role: MembershipRole, permission: string): boolean {
  return rolePermissions[role]?.has(permission as PermissionKey) ?? false;
}
