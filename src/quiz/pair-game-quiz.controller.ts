import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async returnCurrentGame(@CurrentUserId() currentUserId: string) {
    return await this.queryBus.execute(new GetGamePairQuizQuery(currentUserId));
  }

  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async returnGameById(
    @Param('gameId') gameId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.queryBus.execute(
      new GetGamePairQuizQuery(currentUserId, gameId),
    );
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async connection(@CurrentUserId() currentUserId: string) {
    const game = await this.commandBus.execute(
      new SetGamePairCommand(currentUserId),
    );

    return await this.queryBus.execute(
      new GetGamePairQuizQuery(currentUserId, game.id),
    );
  }

  @Post('my-current/answers')
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
