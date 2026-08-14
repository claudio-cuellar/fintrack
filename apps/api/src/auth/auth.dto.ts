import { IsEmail, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @Length(2, 80) firstName!: string;
  @IsString() @Length(2, 80) lastName!: string;
  @IsString() @MinLength(12) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'Password must include upper, lower, and numeric characters' }) password!: string;
  @IsOptional() @IsString() @Length(2, 120) workspaceName?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) password!: string;
}

export class RefreshDto {
  @IsOptional() @IsString() refreshToken?: string;
}

export class ForgotPasswordDto { @IsEmail() email!: string; }
export class ResetPasswordDto { @IsString() token!: string; @IsString() @MinLength(12) password!: string; }
