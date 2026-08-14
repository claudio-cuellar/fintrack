import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { CurrentUser, Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { ChangeRoleDto, CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto } from './workspaces.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) { return this.service.list(user).then((data) => ({ data })); }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWorkspaceDto) { return this.service.create(user, dto).then((data) => ({ data })); }

  @Get(':workspaceId')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.WorkspaceRead)
  get(@Workspace() context: WorkspaceContext) { return this.service.get(context).then((data) => ({ data })); }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.WorkspaceManage)
  update(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateWorkspaceDto) { return this.service.update(context, dto, user.userId).then((data) => ({ data })); }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.WorkspaceRead)
  members(@Workspace() context: WorkspaceContext) { return this.service.members(context).then((data) => ({ data })); }

  @Post(':workspaceId/invitations')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.MembersManage)
  invite(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: InviteMemberDto) { return this.service.invite(context, dto, user.userId).then((data) => ({ data })); }

  @Patch(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.MembersManage)
  changeRole(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('memberId') memberId: string, @Body() dto: ChangeRoleDto) { return this.service.changeRole(context, memberId, dto, user.userId).then((data) => ({ data })); }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceContextGuard, PermissionGuard)
  @Permissions(Permission.MembersManage)
  remove(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('memberId') memberId: string) { return this.service.remove(context, memberId, user.userId).then((data) => ({ data })); }
}
