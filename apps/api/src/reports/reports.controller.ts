import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspaceContext } from '../common/auth.types';
import { Permissions, Workspace } from '../common/decorators/auth.decorators';
import { JwtAuthGuard, PermissionGuard, WorkspaceContextGuard } from '../common/guards/security.guards';
import { Permission } from '../authorization/permissions';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('workspaces/:workspaceId/reports')
@UseGuards(JwtAuthGuard, WorkspaceContextGuard, PermissionGuard)
@Permissions(Permission.ReportsRead)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}
  @Get('summary') summary(@Workspace() context: WorkspaceContext, @Query('from') from?: string, @Query('to') to?: string) { return this.service.summary(context, from, to).then((data) => ({ data })); }
}
