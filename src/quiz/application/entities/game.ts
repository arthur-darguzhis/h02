import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';
import { User } from '../../../users/application/entities/user';

@Entity({ name: 'game' })
export class Game {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'enum', enum: GameStatus, name: 'status' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'first_player_id' })
  firstPlayer: User;

  @Column('uuid', { name: 'first_player_id' })
  firstPlayerId: string;

  @Column('smallint', { name: 'first_player_score', default: 0 })
  firstPlayerScore: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'second_player_id' })
  secondPlayer: User;

  @Column('uuid', { name: 'second_player_id', nullable: true })
  secondPlayerId: string;

  @Column('smallint', { name: 'second_player_score', default: 0 })
  secondPlayerScore: number;

  @Column('timestamp with time zone', { name: 'pair_created_date' })
  pairCreatedDate: Date;

  @Column('timestamp with time zone', {
    name: 'start_game_date',
    nullable: true,
  })
  startGameDate: Date;

  @Column('timestamp with time zone', {
    name: 'finish_game_date',
    nullable: true,
  })
  finishGameDate: Date;
}
