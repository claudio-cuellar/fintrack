import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { CurrentUser, Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller('workspaces/:workspaceId/accounts')
@UseGuards(JwtAuthGuard, WorkspaceContextGuard)
export class AccountsController {
  constructor(private readonly service: AccountsService) {}
  @Get() list(@Workspace() context: WorkspaceContext) { return this.service.list(context).then((data) => ({ data: data.map((item) => ({ ...item, initialBalanceMinor: item.initialBalanceMinor.toString(), currentBalanceMinor: item.currentBalanceMinor.toString() })) })); }
  @Post() @UseGuards(PermissionGuard) @Permissions(Permission.AccountsManage) create(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAccountDto) { return this.service.create(context, user.userId, dto).then((data) => ({ data })); }
  @Patch(':accountId') @UseGuards(PermissionGuard) @Permissions(Permission.AccountsManage) update(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('accountId') id: string, @Body() dto: UpdateAccountDto) { return this.service.update(context, user.userId, id, dto).then((data) => ({ data })); }
}
