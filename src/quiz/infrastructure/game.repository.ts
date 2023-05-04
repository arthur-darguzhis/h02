import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../application/entities/game';
import { GameStatus } from '../../common/pgTypes/enum/gameStatus';
import { UnauthorizedActionException } from '../../common/exceptions/domain.exceptions/unauthorized-action.exception';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async save(game: Game) {
    return await this.gameRepository.save(game);
  }

  async findById(gameId) {
    return await this.gameRepository.findOneBy({ id: gameId });
  }

  async findOpenedGame(): Promise<Game | null> {
    return await this.gameRepository.findOneBy({
      status: GameStatus.PendingSecondPlayer,
    });
  }

  async findActiveGameForUser(userId: string): Promise<Game | null> {
    return await this.gameRepository
      .createQueryBuilder('game')
      .where('game.status = :status', { status: GameStatus.Active })
      .andWhere(
        '(game.first_player_id = :userId OR game.second_player_id = :userId)',
        { userId: userId },
      )
      .getOne();
  }

  async getActiveGameForUser(userId: string): Promise<Game | null> {
    const game = await this.findActiveGameForUser(userId);
    if (game === null) {
      throw new UnauthorizedActionException('User has not any active game');
    }
    return game;
  }
}
