import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { GameQueryRepository } from '../../infrastructure/game-query.repository';

export class GetGamePairQuizQuery {
  constructor(
    public readonly currentUserId: string,
    public readonly gameId: string = null,
  ) {}
}

@QueryHandler(GetGamePairQuizQuery)
export class GetGamePairQuizHandler implements IQueryHandler {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected gameQueryRepository: GameQueryRepository,
  ) {}
  async execute(query: GetGamePairQuizQuery) {
    let gameId = query.gameId;
    if (gameId === null) {
      gameId = await this.gameQueryRepository.getActiveGameIdForUser(
        query.currentUserId,
      );
    }

    const gameData = await this.gameQueryRepository.getGameData(gameId);

    if (
      gameData.firstPlayerId !== query.currentUserId &&
      gameData.secondPlayerId !== query.currentUserId
    ) {
      throw new UnauthorizedActionException(
        'User tries to get pair in which user is not participant',
      );
    }

    let secondPlayerProgress = null;
    if (gameData.secondPlayerId !== null) {
      secondPlayerProgress = {
        answers: await this.gameQueryRepository.getUserAnswers(
          gameId,
          gameData.secondPlayerId,
        ),
        player: await this.gameQueryRepository.getUserInfo(
          gameData.secondPlayerId,
        ),
        score: gameData.secondPlayerScore,
      };
    }

    return {
      id: gameData.id,
      firstPlayerProgress: {
        answers: await this.gameQueryRepository.getUserAnswers(
          gameId,
          gameData.firstPlayerId,
        ),
        player: await this.gameQueryRepository.getUserInfo(
          gameData.firstPlayerId,
        ),
        score: gameData.firstPlayerScore,
      },
      secondPlayerProgress: secondPlayerProgress,
      questions: await this.gameQueryRepository.getQuestions(gameId),
      status: gameData.status,
      pairCreatedDate: gameData.pairCreatedDate,
      startGameDate: gameData.startGameDate,
      finishGameDate: gameData.finishGameDate,
    };
  }
}
