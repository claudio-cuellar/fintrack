import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/auth.decorators';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshDto, RegisterDto, ResetPasswordDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) { return this.withRefreshCookie(response, await this.auth.register(dto)); }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) { return this.withRefreshCookie(response, await this.auth.login(dto)); }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = dto.refreshToken || request.cookies?.refresh_token;
    return this.withRefreshCookie(response, await this.auth.refresh(token || ''));
  }

  @Public()
  @Post('logout')
  async logout(@Body() dto: RefreshDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(dto.refreshToken || request.cookies?.refresh_token);
    response.clearCookie('refresh_token', this.cookieOptions());
    return { data: { success: true } };
  }

  @Public()
  @Post('password/forgot')
  forgotPassword(@Body() _dto: ForgotPasswordDto) { return { data: { accepted: true } }; }

  @Public()
  @Post('password/reset')
  resetPassword(@Body() _dto: ResetPasswordDto) { return { data: { accepted: true } }; }

  private withRefreshCookie(response: Response, result: Awaited<ReturnType<AuthService['login']>>) {
    response.cookie('refresh_token', result.refreshToken, this.cookieOptions());
    return { data: { accessToken: result.accessToken, user: result.user } };
  }

  private cookieOptions() { return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/v1/auth' }; }
}
