import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserSessionsQueryRepository } from './user-sessions.query-repository';
import { UserSessionsService } from './user-sessions.service';
import { RefreshTokenPayload } from '../global-services/decorators/get-refresh-token-from-cookie.decorator';
import { RefreshTokenInCookieGuard } from '../auth/guards/refresh-token-in-cookie';

@Controller('security')
export class SecurityController {
  constructor(
    private userSessionsQueryRepository: UserSessionsQueryRepository,
    private securityService: UserSessionsService,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenInCookieGuard)
  async getAllUserSessions(
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
  ) {
    return await this.userSessionsQueryRepository.findByUserId(
      refreshTokenPayload.userId,
    );
  }

  @Delete('devices')
  @UseGuards(RefreshTokenInCookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async purgeOtherSessions(
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
  ) {
    await this.securityService.purgeOtherSessions(
      refreshTokenPayload.deviceId,
      refreshTokenPayload.userId,
    );
  }

  @Delete('devices/:deviceId')
  @UseGuards(RefreshTokenInCookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async purgeSessionByDeviceId(
    @Param('deviceId') deviceId: string,
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
  ) {
    await this.securityService.purgeSessionByDeviceId(
      deviceId,
      refreshTokenPayload.userId,
    );
  }
}
