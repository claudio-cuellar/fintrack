import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, MembershipRole, MembershipStatus, UserStatus, WorkspaceType } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { ChangeRoleDto, CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto } from './workspaces.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list(user: AuthenticatedUser) {
    const rows = await this.prisma.workspaceMembership.findMany({ where: { userId: user.userId, status: MembershipStatus.ACTIVE }, include: { workspace: true }, orderBy: { createdAt: 'asc' } });
    return rows.map((row) => ({ ...row.workspace, membershipId: row.id, role: row.role }));
  }

  async create(user: AuthenticatedUser, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({ data: { name: dto.name.trim(), type: dto.type, currency: dto.currency?.toUpperCase() || 'USD', timezone: dto.timezone || 'UTC', ownerUserId: user.userId } });
      const membership = await tx.workspaceMembership.create({ data: { workspaceId: created.id, userId: user.userId, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE } });
      return { ...created, membershipId: membership.id, role: membership.role };
    });
    await this.audit.record({ action: AuditAction.CREATE, entityType: 'Workspace', entityId: workspace.id, workspaceId: workspace.id, actorUserId: user.userId });
    return workspace;
  }

  async get(context: WorkspaceContext) {
    const workspace = await this.prisma.workspace.findFirst({ where: { id: context.workspaceId }, include: { memberships: { where: { status: MembershipStatus.ACTIVE }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async update(context: WorkspaceContext, dto: UpdateWorkspaceDto, userId: string) {
    if (context.role !== MembershipRole.OWNER) throw new ForbiddenException('Only the owner can update workspace settings');
    const workspace = await this.prisma.workspace.update({ where: { id: context.workspaceId }, data: { ...dto, currency: dto.currency?.toUpperCase() } });
    await this.audit.record({ action: AuditAction.UPDATE, entityType: 'Workspace', entityId: workspace.id, workspaceId: workspace.id, actorUserId: userId });
    return workspace;
  }

  async members(context: WorkspaceContext) {
    return this.prisma.workspaceMembership.findMany({ where: { workspaceId: context.workspaceId, status: { not: MembershipStatus.REMOVED } }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' } });
  }

  async invite(context: WorkspaceContext, dto: InviteMemberDto, userId: string) {
    if (dto.role === MembershipRole.OWNER) throw new ForbiddenException('Owner invitations are not allowed');
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.workspaceMembership.findFirst({ where: { workspaceId: context.workspaceId, user: { email }, status: { in: [MembershipStatus.ACTIVE, MembershipStatus.INVITED] } } });
    if (existing) throw new ConflictException('This email already has a membership');
    const rawToken = randomBytes(32).toString('base64url');
    const invitation = await this.prisma.invitation.create({ data: { workspaceId: context.workspaceId, email, role: dto.role, tokenHash: this.hash(rawToken), expiresAt: new Date(Date.now() + 7 * 86_400_000), invitedByUserId: userId } });
    await this.audit.record({ action: AuditAction.INVITE, entityType: 'Invitation', entityId: invitation.id, workspaceId: context.workspaceId, actorUserId: userId, metadata: { role: dto.role } });
    return { id: invitation.id, email, role: invitation.role, expiresAt: invitation.expiresAt, developmentToken: process.env.NODE_ENV === 'production' ? undefined : rawToken };
  }

  async changeRole(context: WorkspaceContext, memberId: string, dto: ChangeRoleDto, userId: string) {
    const target = await this.findMember(context.workspaceId, memberId);
    if (target.role === MembershipRole.OWNER || dto.role === MembershipRole.OWNER) throw new ForbiddenException('Ownership transfer requires a dedicated workflow');
    if (context.role === MembershipRole.ADMIN && target.role === MembershipRole.ADMIN) throw new ForbiddenException('Admins cannot modify administrators or owners');
    const updated = await this.prisma.workspaceMembership.update({ where: { id: memberId }, data: { role: dto.role } });
    await this.audit.record({ action: AuditAction.ROLE_CHANGE, entityType: 'WorkspaceMembership', entityId: memberId, workspaceId: context.workspaceId, actorUserId: userId, metadata: { from: target.role, to: dto.role } });
    return updated;
  }

  async remove(context: WorkspaceContext, memberId: string, userId: string) {
    const target = await this.findMember(context.workspaceId, memberId);
    if (target.role === MembershipRole.OWNER) throw new ForbiddenException('The owner cannot be removed');
    if (context.role === MembershipRole.ADMIN && target.role === MembershipRole.ADMIN) throw new ForbiddenException('Admins cannot remove administrators');
    const updated = await this.prisma.workspaceMembership.update({ where: { id: memberId }, data: { status: MembershipStatus.REMOVED } });
    await this.audit.record({ action: AuditAction.MEMBER_REMOVE, entityType: 'WorkspaceMembership', entityId: memberId, workspaceId: context.workspaceId, actorUserId: userId });
    return updated;
  }

  private async findMember(workspaceId: string, memberId: string) {
    const target = await this.prisma.workspaceMembership.findFirst({ where: { id: memberId, workspaceId, status: { not: MembershipStatus.REMOVED } } });
    if (!target) throw new NotFoundException('Member not found');
    return target;
  }

  private hash(value: string): string { return createHash('sha256').update(value).digest('hex'); }
}
