import { Injectable } from '@nestjs/common';
import { UserSessionsRepository } from './user-sessions.repository';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserSessionsService {
  constructor(
    private userSessionsRepository: UserSessionsRepository,
    private jwtService: JwtService,
  ) {}

  async purgeSessionByDeviceId(deviceId, userId): Promise<void | never> {
    const userActiveSession = await this.userSessionsRepository.getByDeviceId(
      deviceId,
    );

    if (userActiveSession.userId !== userId) {
      throw new UnauthorizedActionException('Unable to delete session');
    }

    await this.userSessionsRepository.purgeSessionByDeviceId(deviceId, userId);
  }

  async purgeOtherSessions(deviceId: string, userId: string) {
    await this.userSessionsRepository.purgeOtherSessions(deviceId, userId);
  }

  async updateSessionByDeviceId(
    deviceId: string,
    refreshToken: string,
    ip: string,
    userAgent: string,
  ) {
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });
    const userSession = await this.userSessionsRepository.getByDeviceId(
      deviceId,
    );
    userSession.issuedAt = decodedRefreshToken.iat;
    userSession.expireAt = decodedRefreshToken.exp;
    userSession.ip = ip;
    userSession.deviceName = userAgent || 'unknown';

    await this.userSessionsRepository.save(userSession);
  }

  async removeUserSession(deviceId: string, userId: string) {
    await this.userSessionsRepository.deleteByDeviceId(deviceId, userId);
  }
}
