import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (
      !req.cookies ||
      !req.cookies.refreshToken ||
      req.cookies.refreshToken === ''
    ) {
      throw new UnauthorizedException();
    }

    try {
      jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET);
    } catch (e) {
      throw new UnauthorizedException('refresh JWT is invalid');
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
