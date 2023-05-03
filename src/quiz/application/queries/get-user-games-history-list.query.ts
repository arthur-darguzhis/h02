import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';
import { GameQueryRepository } from '../../infrastructure/game-query.repository';

export class GetUserGamesHistoryListQuery {
  constructor(
    public readonly currentUserId: string,
    public readonly sortBy: string = 'pairCreatedDate',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
  ) {}
}

@QueryHandler(GetUserGamesHistoryListQuery)
export class GetUserGamesHistoryListHandler implements IQueryHandler {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected gameQueryRepository: GameQueryRepository,
  ) {}

  async execute(query: GetUserGamesHistoryListQuery) {
    let count = await this.dataSource.query(
      `SELECT COUNT(*) count 
                FROM game 
              WHERE status <> $1 AND (first_player_id = $2 OR second_player_id = $2)`,
      [GameStatus.PendingSecondPlayer, query.currentUserId],
    );
    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const sortFields = {
      pairCreatedDate: 'game.pair_created_date',
    };

    const gamesIdList = await this.dataSource.query(
      `SELECT id 
                FROM game 
              WHERE status <> $1 AND (first_player_id = $2 OR second_player_id = $2)
             ORDER BY ${sortFields[query.sortBy]} ${query.sortDirection}
             LIMIT $3 OFFSET $4`,
      [
        GameStatus.PendingSecondPlayer,
        query.currentUserId,
        query.pageSize,
        offset,
      ],
    );

    const result = await Promise.all(
      gamesIdList.map(async (row) => await this.prepareGameInfo(row.id)),
    );
    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: result,
    };
  }

  async prepareGameInfo(gameId) {
    const gameData = await this.gameQueryRepository.getGameData(gameId);

    return {
      id: gameId,
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
      secondPlayerProgress: {
        answers: await this.gameQueryRepository.getUserAnswers(
          gameId,
          gameData.secondPlayerId,
        ),
        player: await this.gameQueryRepository.getUserInfo(
          gameData.secondPlayerId,
        ),
        score: gameData.secondPlayerScore,
      },
      questions: await this.gameQueryRepository.getQuestions(gameId),
      status: gameData.status,
      pairCreatedDate: gameData.pairCreatedDate,
      startGameDate: gameData.startGameDate,
      finishGameDate: gameData.finishGameDate,
    };
  }
}
