import { InjectModel } from '@nestjs/mongoose';
import { UserSessions, UserSessionsDocument } from './user-sessions-schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserSessionsFactory {
  constructor(
    @InjectModel(UserSessions.name)
    private userSessionsModel: Model<UserSessionsDocument>,
    private jwtService: JwtService,
  ) {}

  async createNewUserSession(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ) {
    //TODO со временем все вот эти jwt вызовы оформить в сервис который заинджектить в фабрику а не связывать нак насмерть
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });
    await this.userSessionsModel.create({
      issuedAt: decodedRefreshToken.iat,
      expireAt: decodedRefreshToken.exp,
      deviceId: decodedRefreshToken.deviceId,
      ip: ip,
      deviceName: userAgent || 'unknown',
      userId: decodedRefreshToken.userId,
    });
  }
}
