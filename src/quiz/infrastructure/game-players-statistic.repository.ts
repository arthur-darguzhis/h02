import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePlayerStatistic } from '../application/entities/game-players-statistic';

@Injectable()
export class GamePlayersStatisticRepository {
  constructor(
    @InjectRepository(GamePlayerStatistic)
    private gamePlayerStatisticRepository: Repository<GamePlayerStatistic>,
  ) {}

  async save(gamePlayerStatistic: GamePlayerStatistic) {
    return await this.gamePlayerStatisticRepository.save(gamePlayerStatistic);
  }
}
