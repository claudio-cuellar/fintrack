import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { CurrentUser, Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('workspaces/:workspaceId/categories')
@UseGuards(JwtAuthGuard, WorkspaceContextGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() list(@Workspace() context: WorkspaceContext, @Query('includeArchived') includeArchived?: string) { return this.service.list(context, includeArchived === 'true').then((data) => ({ data })); }
  @Post() @UseGuards(PermissionGuard) @Permissions(Permission.CategoriesManage) create(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCategoryDto) { return this.service.create(context, user.userId, dto).then((data) => ({ data })); }
  @Patch(':categoryId') @UseGuards(PermissionGuard) @Permissions(Permission.CategoriesManage) update(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('categoryId') id: string, @Body() dto: UpdateCategoryDto) { return this.service.update(context, user.userId, id, dto).then((data) => ({ data })); }
  @Patch(':categoryId/archive') @UseGuards(PermissionGuard) @Permissions(Permission.CategoriesManage) archive(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('categoryId') id: string) { return this.service.archive(context, user.userId, id).then((data) => ({ data })); }
}
