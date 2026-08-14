import { TransactionType } from '@prisma/client';
import { IsEnum, IsISO8601, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(TransactionType) type!: TransactionType;
  @IsNumberString() amountMinor!: string;
  @IsString() @Length(3, 3) currency!: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsUUID() destinationAccountId?: string;
  @IsOptional() @IsUUID() paidByMembershipId?: string;
  @IsISO8601() occurredAt!: string;
  @IsString() @IsNotEmpty() @Length(1, 160) description!: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class UpdateTransactionDto {
  @IsOptional() @IsString() @Length(1, 160) description?: string;
  @IsOptional() @IsISO8601() occurredAt?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsUUID() categoryId?: string;
}
