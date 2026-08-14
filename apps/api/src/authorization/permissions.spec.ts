import { MembershipRole } from '@prisma/client';
import { Permission, roleHasPermission } from './permissions';

describe('workspace permission policy', () => {
  it('gives owners full MVP access', () => {
    expect(roleHasPermission(MembershipRole.OWNER, Permission.CategoriesManage)).toBe(true);
    expect(roleHasPermission(MembershipRole.OWNER, Permission.AuditRead)).toBe(true);
  });

  it('keeps members from managing centralized categories', () => {
    expect(roleHasPermission(MembershipRole.MEMBER, Permission.TransactionsCreate)).toBe(true);
    expect(roleHasPermission(MembershipRole.MEMBER, Permission.CategoriesManage)).toBe(false);
    expect(roleHasPermission(MembershipRole.MEMBER, Permission.MembersManage)).toBe(false);
  });

  it('makes viewers read-only', () => {
    expect(roleHasPermission(MembershipRole.VIEWER, Permission.ReportsRead)).toBe(true);
    expect(roleHasPermission(MembershipRole.VIEWER, Permission.TransactionsCreate)).toBe(false);
  });
});
