import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { CategoryKind } from '@prisma/client';

export class CreateCategoryDto {
  @IsString() @Length(1, 80) name!: string;
  @IsOptional() @IsEnum(CategoryKind) kind?: CategoryKind;
  @IsOptional() @IsString() @Length(1, 80) icon?: string;
  @IsOptional() @IsString() @Length(1, 16) color?: string;
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000) position?: number;
}
export class UpdateCategoryDto {
  @IsOptional() @IsString() @Length(1, 80) name?: string;
  @IsOptional() @IsString() @Length(1, 80) icon?: string;
  @IsOptional() @IsString() @Length(1, 16) color?: string;
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000) position?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
