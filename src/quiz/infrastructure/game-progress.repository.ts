import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameProgress } from '../application/entities/game-progress';
import { UnauthorizedActionException } from '../../common/exceptions/domain.exceptions/unauthorized-action.exception';

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
}
