import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../../posts/application/entities/post';
import { User } from '../../../users/application/entities/user';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 300, collation: 'C', name: 'content' })
  content: string;

  @Column({ type: 'boolean', default: false, name: 'is_banned' })
  isBanned: boolean;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({ type: 'integer', default: 0, name: 'likes_count' })
  likesCount: number;

  @Column({ type: 'integer', default: 0, name: 'dislikes_count' })
  dislikesCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;
}
