import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/application/entities/user';
import { Comment } from './comment';
import { LikeStatus } from '../../../common/pgTypes/enum/likeStatus';

@Entity({ name: 'comment_reactions' })
export class CommentReaction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'comment_id' })
  commentId: string;

  @Column({ type: 'enum', enum: LikeStatus, name: 'status' })
  status: string;

  @Column('boolean', { name: 'is_banned' })
  isBanned: boolean;

  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
