import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameStatus } from '../../common/pgTypes/enum/gameStatus';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Game } from '../application/entities/game';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async getActiveGameIdForUser(currentUserId) {
    const activeGame = await this.dataSource.query(
      `SELECT id FROM game WHERE (first_player_id = $1 OR second_player_id = $1) AND status <> $2`,
      [currentUserId, GameStatus.Finished],
    );

    if (activeGame.length === 0) {
      throw new EntityNotFoundException(
        'There is no one active game for current user',
      );
    }

    return activeGame[0].id;
  }

  async getGameData(gameId): Promise<Game | never> {
    const game: Game = await this.gameRepository.findOneBy({ id: gameId });

    if (game === null) {
      throw new EntityNotFoundException(`There is no game with id: ${gameId}`);
    }
    return game;

    ///
    // const sql = `
    //     SELECT
    //        id,
    //        first_player_id AS "firstPlayerId",
    //        first_player_score AS "firstPlayerScore",
    //        second_player_id AS "secondPlayerId",
    //        second_player_score AS "secondPlayerScore",
    //        status,
    //        pair_created_date AS "pairCreatedDate",
    //        start_game_date AS "startGameDate",
    //        finish_game_date AS "finishGameDate"
    //     FROM game
    //     WHERE id = $1`;
    //
    // const gameData = await this.dataSource.query(sql, [gameId]);

    // let gameData;
    // try {
    //   gameData = await this.dataSource.query(sql, [gameId]);
    // } catch (e) {
    //   throw new InvalidValueException('gameId is invalid', 'gameId');
    // }

    // if (gameData.length === 0) {
    //   throw new EntityNotFoundException(`There is no game with id: ${gameId}`);
    // }
    //
    // return gameData[0];
  }

  async getUserAnswers(gameId, userId): Promise<[] | null> {
    return await this.dataSource.query(
      `SELECT 
               quiz_question_id as "questionId",
               answer_status as "answerStatus",
               answer_date as "addedAt"
              FROM game_progress
              WHERE game_id = $1 AND user_id = $2
                AND game_progress.answer_status IS NOT NULL
              ORDER BY question_number ASC`,
      [gameId, userId],
    );
  }

  async getUserInfo(userId): Promise<[] | null> {
    const userInfo = await this.dataSource.query(
      `SELECT id, login FROM users WHERE id = $1`,
      [userId],
    );
    return userInfo[0] || null;
  }

  async getQuestions(gameId): Promise<[] | null> {
    const questions = await this.dataSource.query(
      `
          SELECT quiz_question_id as id, body
          FROM game_progress
                   JOIN quiz_questions qq on qq.id = game_progress.quiz_question_id
          WHERE game_id = $1
          GROUP BY quiz_question_id, body, question_number
          ORDER BY question_number ASC;`,
      [gameId],
    );

    return questions.length > 0 ? questions : null;
  }
}
