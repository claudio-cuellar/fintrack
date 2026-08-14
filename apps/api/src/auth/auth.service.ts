import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MembershipRole, MembershipStatus, UserStatus, WorkspaceType } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto, RegisterDto } from './auth.dto';

export interface AuthResult { accessToken: string; refreshToken: string; user: { id: string; email: string; firstName: string; lastName: string }; }

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService, private readonly audit: AuditService) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('An account with this email already exists');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, passwordHash, firstName: dto.firstName.trim(), lastName: dto.lastName.trim(), status: UserStatus.ACTIVE, emailVerifiedAt: new Date() } });
      const workspace = await tx.workspace.create({ data: { name: dto.workspaceName?.trim() || `${dto.firstName.trim()}'s Finances`, type: WorkspaceType.PERSONAL, ownerUserId: user.id } });
      const membership = await tx.workspaceMembership.create({ data: { workspaceId: workspace.id, userId: user.id, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE, displayName: `${user.firstName} ${user.lastName}` } });
      return { user, workspace, membership };
    });
    await this.audit.record({ action: 'CREATE', entityType: 'User', entityId: result.user.id, actorUserId: result.user.id, metadata: { event: 'registration' } });
    return this.issueTokens(result.user.id, result.user.email, result.user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || user.status === UserStatus.SUSPENDED || user.status === UserStatus.DELETED || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException('Invalid email or password');
    const result = await this.issueTokens(user.id, user.email, user);
    await this.audit.record({ action: 'LOGIN', entityType: 'User', entityId: user.id, actorUserId: user.id });
    return result;
  }

  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: tokenHash }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Invalid refresh token');
    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(session.user.id, session.user.email, session.user, session.tokenFamily);
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    await this.prisma.session.updateMany({ where: { refreshTokenHash: this.hashToken(rawRefreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private async issueTokens(userId: string, email: string, user: { id: string; email: string; firstName: string; lastName: string }, tokenFamily = randomBytes(16).toString('hex')): Promise<AuthResult> {
    const sessionId = randomBytes(16).toString('hex');
    const accessToken = await this.jwt.signAsync({ sub: userId, email, sid: sessionId, type: 'access' });
    const refreshToken = randomBytes(48).toString('base64url');
    const days = this.config.get<number>('REFRESH_TOKEN_TTL_DAYS', 30);
    await this.prisma.session.create({ data: { userId, refreshTokenHash: this.hashToken(refreshToken), tokenFamily, expiresAt: new Date(Date.now() + days * 86_400_000), userAgent: 'api' } });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } };
  }

  private hashToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }
}
