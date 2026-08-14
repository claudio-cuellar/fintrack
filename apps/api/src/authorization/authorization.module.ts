import { Global, Module } from '@nestjs/common';
import { PermissionGuard, WorkspaceContextGuard, JwtAuthGuard } from '../common/guards/security.guards';

@Global()
@Module({ providers: [PermissionGuard, WorkspaceContextGuard, JwtAuthGuard], exports: [PermissionGuard, WorkspaceContextGuard, JwtAuthGuard] })
export class AuthorizationModule {}
