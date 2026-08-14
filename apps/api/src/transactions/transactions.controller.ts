import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { AuthenticatedUser, WorkspaceContext } from '../common/auth.types';
import { CurrentUser, Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { CreateTransactionDto, UpdateTransactionDto } from './transactions.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('workspaces/:workspaceId/transactions')
@UseGuards(JwtAuthGuard, WorkspaceContextGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}
  @Get() @UseGuards(PermissionGuard) @Permissions(Permission.TransactionsRead) list(@Workspace() context: WorkspaceContext, @Query() query: { cursor?: string; limit?: number; type?: TransactionType; categoryId?: string; memberId?: string; from?: string; to?: string }) { return this.service.list(context, query); }
  @Post() @UseGuards(PermissionGuard) @Permissions(Permission.TransactionsCreate) create(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTransactionDto) { return this.service.create(context, user.userId, dto).then((data) => ({ data })); }
  @Patch(':transactionId') @UseGuards(PermissionGuard) @Permissions(Permission.TransactionsManageAny, Permission.TransactionsManageOwn) update(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('transactionId') id: string, @Body() dto: UpdateTransactionDto) { return this.service.update(context, user.userId, id, dto).then((data) => ({ data })); }
  @Delete(':transactionId') @UseGuards(PermissionGuard) @Permissions(Permission.TransactionsManageAny, Permission.TransactionsManageOwn) remove(@Workspace() context: WorkspaceContext, @CurrentUser() user: AuthenticatedUser, @Param('transactionId') id: string) { return this.service.remove(context, user.userId, id).then((data) => ({ data })); }
}
