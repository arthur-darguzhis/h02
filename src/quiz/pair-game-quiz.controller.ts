import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { SendAnswerDto } from './api/dto/send-answer.dto';
import { CurrentUserId } from '../global-services/decorators/current-user-id.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SetGamePairCommand } from './application/use-cases/pair-game-quiz.use-case';
import { GetGamePairQuizQuery } from './application/queries/get-game-pair-quiz.query';
import { SetAnswerCommand } from './application/use-cases/set-answer.use-case';
import { GetResultOfAnswerQuery } from './application/queries/get-result-of-answer.query';
import { GetUserGamesHistoryListDto } from './api/dto/get-user-games-history-list.dto';
import { GetUserGamesHistoryListQuery } from './application/queries/get-user-games-history-list.query';
import { GetUserStatisticQuery } from './application/queries/get-user-statistic.query';
import { GetUsersTopListDto } from './api/dto/get-users-top-list.dto';
import { GetUsersTopListQuery } from './application/queries/get-users-top-list.query';

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz')
export class PairGameQuizController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get('users/top')
  @HttpCode(HttpStatus.OK)
  async getTopStatistic(@Query() dto: GetUsersTopListDto) {
    return this.queryBus.execute(new GetUsersTopListQuery(dto.sort));
  }

  @Get('users/my-statistic')
  @HttpCode(HttpStatus.OK)
  async getStatisticForUser(@CurrentUserId() currentUserId: string) {
    return this.queryBus.execute(new GetUserStatisticQuery(currentUserId));
  }

  @Get('pairs/my')
  @HttpCode(HttpStatus.OK)
  async returnGamesHistoryListForUser(
    @Param() dto: GetUserGamesHistoryListDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return this.queryBus.execute(
      new GetUserGamesHistoryListQuery(
        currentUserId,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }

  @Get('pairs/my-current')
  @HttpCode(HttpStatus.OK)
  async returnCurrentGame(@CurrentUserId() currentUserId: string) {
    return await this.queryBus.execute(new GetGamePairQuizQuery(currentUserId));
  }

  @Get('pairs/:gameId')
  @HttpCode(HttpStatus.OK)
  async returnGameById(
    @Param('gameId') gameId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.queryBus.execute(
      new GetGamePairQuizQuery(currentUserId, gameId),
    );
  }

  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connection(@CurrentUserId() currentUserId: string) {
    const game = await this.commandBus.execute(
      new SetGamePairCommand(currentUserId),
    );

    return await this.queryBus.execute(
      new GetGamePairQuizQuery(currentUserId, game.id),
    );
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async sendAnswer(
    @Body() dto: SendAnswerDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const answer = await this.commandBus.execute(
      new SetAnswerCommand(currentUserId, dto.answer),
    );

    return await this.queryBus.execute(new GetResultOfAnswerQuery(answer.id));
  }
}
