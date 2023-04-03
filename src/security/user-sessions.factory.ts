import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSessionsPgRepository } from './infrastructure/user-sessions-pg.repository';

@Injectable()
export class UserSessionsFactory {
  constructor(
    private jwtService: JwtService,
    private userSessionsPgRepository: UserSessionsPgRepository,
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
