import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from '../users/application/entities/user-session';

@Injectable()
export class UserSessionsFactory {
  constructor(private jwtService: JwtService) {}

  async createNewUserSession(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ) {
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });
    const userSession = new UserSession();
    userSession.issuedAt = decodedRefreshToken.iat;
    userSession.expireAt = decodedRefreshToken.exp;
    userSession.deviceId = decodedRefreshToken.deviceId;
    userSession.ip = ip;
    userSession.deviceName = userAgent ?? 'unknown';
    userSession.userId = decodedRefreshToken.userId;

    return userSession;
  }
}
