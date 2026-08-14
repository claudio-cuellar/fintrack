import { IsEnum, IsInt, IsOptional, IsString, IsTimeZone, IsUUID, Length, Max, Min } from 'class-validator';
import { MembershipRole, WorkspaceType } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString() @Length(2, 120) name!: string;
  @IsEnum(WorkspaceType) type!: WorkspaceType;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsTimeZone() timezone?: string;
}

export class UpdateWorkspaceDto {
  @IsOptional() @IsString() @Length(2, 120) name?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsTimeZone() timezone?: string;
}

export class InviteMemberDto {
  @IsString() @Length(5, 320) email!: string;
  @IsEnum(MembershipRole) role!: MembershipRole;
}

export class ChangeRoleDto { @IsEnum(MembershipRole) role!: MembershipRole; }
export class WorkspaceIdDto { @IsUUID() workspaceId!: string; }
