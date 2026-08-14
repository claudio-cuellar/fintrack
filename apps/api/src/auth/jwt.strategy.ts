import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../common/auth.types';

interface AccessPayload { sub: string; email: string; sid?: string; type: 'access'; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: AccessPayload): AuthenticatedUser {
    if (payload.type !== 'access') throw new Error('Invalid token type');
    return { userId: payload.sub, email: payload.email, sessionId: payload.sid };
  }
}
