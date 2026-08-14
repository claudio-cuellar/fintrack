import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { MembershipStatus } from '@prisma/client';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { roleHasPermission } from '../../authorization/permissions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }
  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

@Injectable()
export class WorkspaceContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();
    const workspaceId = request.params.workspaceId || request.body?.workspaceId || request.query?.workspaceId;
    if (typeof workspaceId !== 'string') throw new ForbiddenException('A workspace context is required');
    const membership = await this.prisma.workspaceMembership.findFirst({
      where: { workspaceId, userId: user.userId, status: MembershipStatus.ACTIVE },
      select: { id: true, workspaceId: true, userId: true, role: true },
    });
    if (!membership) throw new ForbiddenException('You do not belong to this workspace');
    request.workspaceContext = { workspaceId: membership.workspaceId, membershipId: membership.id, userId: membership.userId, role: membership.role };
    return true;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('permissions', [context.getHandler(), context.getClass()]) ?? [];
    if (required.length === 0) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const role = request.workspaceContext?.role;
    if (!role || !required.every((permission) => roleHasPermission(role, permission))) throw new ForbiddenException('Insufficient permission');
    return true;
  }
}
