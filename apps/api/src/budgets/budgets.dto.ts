import { BudgetScope } from '@prisma/client';
import { IsEnum, IsISO8601, IsNumberString, IsOptional, IsUUID, Length } from 'class-validator';

export class CreateBudgetDto {
  @IsEnum(BudgetScope) scope!: BudgetScope;
  @IsOptional() @IsUUID() ownerMembershipId?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsISO8601() periodStart!: string;
  @IsISO8601() periodEnd!: string;
  @IsNumberString() amountMinor!: string;
  @Length(3, 3) currency!: string;
}
