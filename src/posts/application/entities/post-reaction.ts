import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/application/entities/user';
import { Post } from './post';
import { LikeStatus } from '../../../common/pgTypes/enum/likeStatus';

@Entity({ name: 'post_reactions' })
export class PostReaction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'post_id' })
  postId: string;

  @Column({ type: 'enum', enum: LikeStatus, name: 'status' })
  status: string;

  @Column('boolean', { name: 'is_banned' })
  isBanned: boolean;

  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
