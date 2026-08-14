import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { WorkspaceContext } from '../auth.types';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user);
export const Workspace = createParamDecorator((_data: unknown, ctx: ExecutionContext): WorkspaceContext => ctx.switchToHttp().getRequest().workspaceContext);
