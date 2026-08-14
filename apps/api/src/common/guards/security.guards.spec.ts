import { ForbiddenException } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { WorkspaceContextGuard } from './security.guards';

describe('WorkspaceContextGuard', () => {
  const request = (workspaceId: string) => ({ user: { userId: 'user-a', email: 'a@example.com' }, params: { workspaceId } } as any);

  it('accepts only an active membership in the selected workspace', async () => {
    const prisma = { workspaceMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'membership-a', workspaceId: 'workspace-a', userId: 'user-a', role: MembershipRole.MEMBER }) } };
    const guard = new WorkspaceContextGuard(prisma as never);
    const req = request('workspace-a');
    const context = { switchToHttp: () => ({ getRequest: () => req }) } as never;
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.workspaceContext).toEqual({ workspaceId: 'workspace-a', membershipId: 'membership-a', userId: 'user-a', role: MembershipRole.MEMBER });
    expect(prisma.workspaceMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ workspaceId: 'workspace-a', userId: 'user-a' }) }));
  });

  it('rejects a guessed ID for a workspace the user does not belong to', async () => {
    const prisma = { workspaceMembership: { findFirst: jest.fn().mockResolvedValue(null) } };
    const guard = new WorkspaceContextGuard(prisma as never);
    const context = { switchToHttp: () => ({ getRequest: () => request('workspace-b') }) } as never;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
