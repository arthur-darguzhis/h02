import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Game } from './game';
import { User } from '../../../users/application/entities/user';
import { GameResult } from '../../../common/pgTypes/enum/gameResult';

@Index(['game', 'user'], { unique: true })
@Entity({ name: 'game_players_statistic' })
export class GamePlayerStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'game_id' })
  gameId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'smallint' })
  score: number;

  @Column({ type: 'enum', enum: GameResult, name: 'result' })
  result: string;

  @ManyToOne(() => Game)
  game: Game;

  @ManyToOne(() => User)
  user: User;
}
