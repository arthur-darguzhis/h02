import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { userSessionsRepository } from '../../../security/infrastructure/user-sessions.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly userSessionsPgRepository: userSessionsRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const userSession = await this.userSessionsPgRepository.findByDeviceId(
      payload.deviceId,
    );

    if (!userSession || Number(userSession.issuedAt) !== payload.iat) {
      throw new UnauthorizedException('refresh JWT is invalid');
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
