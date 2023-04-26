import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Blog } from './blog';
import { User } from '../../../users/application/entities/user';

@Entity({ name: 'blog_user_ban' })
export class BlogUserBan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Blog, (blog) => blog.bannedUsers)
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @ManyToOne(() => User, (user) => user.bannedInBlogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'boolean', default: false, name: 'is_banned' })
  isBanned: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'ban_date',
  })
  banDate: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true, name: 'ban_reason' })
  banReason: string;
}
