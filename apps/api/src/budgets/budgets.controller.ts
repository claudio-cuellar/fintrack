import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { CurrentUser, Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { CreateBudgetDto } from './budgets.dto';
import { BudgetsService } from './budgets.service';

@ApiTags('budgets')
@Controller('workspaces/:workspaceId/budgets')
@UseGuards(JwtAuthGuard, WorkspaceContextGuard)
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}
  @Get() @UseGuards(PermissionGuard) @Permissions(Permission.WorkspaceRead) list(@Workspace() context: WorkspaceContext) { return this.service.list(context).then((data) => ({ data })); }
  @Post() @UseGuards(PermissionGuard) @Permissions(Permission.BudgetsManage) create(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBudgetDto) { return this.service.create(context, user.userId, dto).then((data) => ({ data })); }
}
