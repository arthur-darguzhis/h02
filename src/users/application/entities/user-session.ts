import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user';

@Entity({ name: 'users_sessions' })
export class UserSession {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'bigint', name: 'issued_at' })
  issuedAt: number;

  @Column({ type: 'bigint', name: 'expire_at' })
  expireAt: number;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'device_id' })
  deviceId: string;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'ip' })
  ip: string;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'device_name' })
  deviceName: string;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;
}
