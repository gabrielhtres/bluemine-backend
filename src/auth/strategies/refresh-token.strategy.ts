import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      passReqToCallback: true,
    };

    super(options);
  }

  validate(req: Request, payload: JwtPayload): JwtRefreshPayload {
    const header = req.get('Authorization');
    const refreshToken = header ? header.replace(/^Bearer\s+/i, '').trim() : '';

    return { ...payload, refreshToken };
  }
}
