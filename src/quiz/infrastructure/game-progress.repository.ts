import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameProgress } from '../application/entities/game-progress';
import { UnauthorizedActionException } from '../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { AnswerStatus } from '../../common/pgTypes/enum/answerStatus';

@Injectable()
export class GameProgressRepository {
  constructor(
    @InjectRepository(GameProgress)
    private gameProgressRepository: Repository<GameProgress>,
  ) {}

  async save(gameProgress: GameProgress) {
    return await this.gameProgressRepository.save(gameProgress);
  }

  async saveMany(gameProgress: GameProgress[]) {
    return await this.gameProgressRepository.save(gameProgress);
  }

  async getNextQuestion(gameId: string, currentUserId: string) {
    const nextQuestion = await this.gameProgressRepository
      .createQueryBuilder('gameProgress')
      .where({ gameId: gameId, userId: currentUserId })
      .andWhere('answer_date IS NULL')
      .orderBy('question_number', 'ASC')
      .getOne();

    if (nextQuestion === null) {
      throw new UnauthorizedActionException(
        'User already answered to all questions',
      );
    }

    return nextQuestion;
  }

  async areAllQuestionsAnswered(gameId: string): Promise<boolean> {
    const notAnsweredQuestion = await this.gameProgressRepository
      .createQueryBuilder('gameProgress')
      .where({ gameId: gameId })
      .andWhere('answer_date IS NULL')
      .getOne();

    return notAnsweredQuestion === null;
  }

  async getCountNotAnsweredQuestions(gameId: string, userId: string) {
    return await this.gameProgressRepository
      .createQueryBuilder('gameProgress')
      .where({ gameId: gameId, userId: userId })
      .andWhere('answer_date IS NULL')
      .getCount();
  }

  async abortNotAnsweredQuestions(gameId: string, userId: string) {
    return await this.gameProgressRepository.update(
      {
        gameId: gameId,
        userId: userId,
      },
      { answerStatus: AnswerStatus.Incorrect },
    );
  }
}
