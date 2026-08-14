import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({ imports: [AuditModule], controllers: [BudgetsController], providers: [BudgetsService] })
export class BudgetsModule {}
