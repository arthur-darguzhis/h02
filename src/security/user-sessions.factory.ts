import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { userSessionsRepository } from './infrastructure/user-sessions.repository';

@Injectable()
export class UserSessionsFactory {
  constructor(
    private jwtService: JwtService,
    private userSessionsPgRepository: userSessionsRepository,
  ) {}

  async createNewUserSessionPg(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ) {
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });

    await this.userSessionsPgRepository.saveNewSession(
      decodedRefreshToken.iat,
      decodedRefreshToken.exp,
      decodedRefreshToken.deviceId,
      ip,
      userAgent,
      decodedRefreshToken.userId,
    );
  }
}
