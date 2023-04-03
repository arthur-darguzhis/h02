import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserPurgeOtherSessionsCommand } from '../application/use-cases/user-purge-other-sessions.use-case';
import { UserPurgeSessionCommand } from '../application/use-cases/user-purge-session.use-case';
import { UserSessionsListQuery } from '../application/query/user-sessions-list.query';
import { JwtRefreshTokenGuard } from '../../auth/infrastructure/guards/jwt-refrest-token.guard';

@Controller('security')
export class SecurityController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @UseGuards(JwtRefreshTokenGuard)
  @Get('devices')
  async getAllUserSessions(@Request() req) {
    return await this.queryBus.execute(
      new UserSessionsListQuery(req.user.userId),
    );
  }

  @Delete('devices')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async purgeOtherSessions(@Request() req) {
    await this.commandBus.execute(
      new UserPurgeOtherSessionsCommand(req.user.deviceId, req.user.userId),
    );
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async purgeSessionByDeviceId(
    @Request() req,
    @Param('deviceId') deviceId: string,
  ) {
    await this.commandBus.execute(
      new UserPurgeSessionCommand(deviceId, req.user.userId),
    );
  }
}
