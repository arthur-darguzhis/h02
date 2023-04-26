import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Blog } from '../../../blogs/application/entities/blog';
import { User } from '../../../users/application/entities/user';
import { Comment } from '../../../comments/application/entities/comment';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 30, collation: 'C', name: 'title' })
  title: string;

  @Column({
    type: 'varchar',
    length: 100,
    collation: 'C',
    name: 'short_description',
  })
  shortDescription: string;

  @Column({ type: 'varchar', length: 1000, collation: 'C', name: 'content' })
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @Column({ type: 'uuid', name: 'blog_id' })
  blogId: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'boolean' })
  is_banned: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'integer' })
  likes_count: number;

  @Column({ type: 'integer' })
  dislikes_count: number;

  @Column({ type: 'jsonb', array: true })
  newest_likes: any[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
