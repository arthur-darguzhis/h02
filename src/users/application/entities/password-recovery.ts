import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user';

@Entity({ name: 'password_recovery' })
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'code' })
  code: string;

  @Column({ type: 'timestamp with time zone', name: 'sending_time' })
  sendingTime: Date;

  @Column({ type: 'timestamp with time zone', name: 'expiration_date' })
  expirationDate: Date;

  @Column({ type: 'boolean', name: 'is_confirmed', default: false })
  isConfirmed: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;
}
