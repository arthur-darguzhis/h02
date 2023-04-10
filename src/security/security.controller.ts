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
import { RefreshTokenInCookieGuard } from '../auth/infrastructure/guards/refresh-token-in-cookie';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserPurgeOtherSessionsCommand } from './application/use-cases/user-purge-other-sessions.use-case';
import { UserPurgeSessionCommand } from './application/use-cases/user-purge-session.use-case';
import { UserSessionsListQuery } from './application/query/user-sessions-list.query';

@Controller('security')
export class SecurityController {
  constructor(
    private userSessionsQueryRepository: UserSessionsQueryRepository,
    private securityService: UserSessionsService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @UseGuards(RefreshTokenInCookieGuard)
  @Get('devices')
  async getAllUserSessions(
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
  ) {
    return await this.queryBus.execute(
      new UserSessionsListQuery(refreshTokenPayload.userId),
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
    await this.commandBus.execute(
      new UserPurgeOtherSessionsCommand(
        refreshTokenPayload.deviceId,
        refreshTokenPayload.userId,
      ),
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
    await this.commandBus.execute(
      new UserPurgeSessionCommand(deviceId, refreshTokenPayload.userId),
    );
  }
}
