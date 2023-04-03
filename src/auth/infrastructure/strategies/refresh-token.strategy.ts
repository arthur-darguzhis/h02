import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserSessionsPgRepository } from '../../../security/user-sessions-pg.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly userSessionsPgRepository: UserSessionsPgRepository,
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
