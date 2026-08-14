import { AccountType, AccountVisibility } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateAccountDto {
  @IsString() @Length(1, 120) name!: string;
  @IsEnum(AccountType) type!: AccountType;
  @IsEnum(AccountVisibility) visibility!: AccountVisibility;
  @IsString() @Length(3, 3) currency!: string;
  @IsOptional() @IsInt() @Min(-9_000_000_000_000_000) @Max(9_000_000_000_000_000) initialBalanceMinor?: number;
  @IsOptional() @IsUUID() ownerMembershipId?: string;
}
export class UpdateAccountDto {
  @IsOptional() @IsString() @Length(1, 120) name?: string;
  @IsOptional() @IsEnum(AccountVisibility) visibility?: AccountVisibility;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
