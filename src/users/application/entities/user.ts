import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { UserSession } from './user-session';
import { BlogUserBan } from '../../../blogs/application/entities/blog-user-ban';
import { Post } from '../../../posts/application/entities/post';
import { Blog } from '../../../blogs/application/entities/blog';

@Entity({ name: 'users' })
@Unique(['login'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'login' })
  login: string;

  @Column({ type: 'varchar', length: 255, collation: 'C', name: 'email' })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    collation: 'C',
    nullable: true,
    name: 'password_hash',
  })
  passwordHash: string;

  @Column({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'varchar',
    length: 255,
    collation: 'C',
    nullable: true,
    name: 'confirmation_code',
  })
  confirmationCode: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'expiration_date_of_confirmation_code',
  })
  expirationDateOfConfirmationCode: Date;

  @Column({ type: 'boolean', default: false, name: 'is_confirmed' })
  isConfirmed: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_banned' })
  isBanned: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'ban_date',
  })
  banDate: Date;

  @Column({ type: 'text', collation: 'C', nullable: true, name: 'ban_reason' })
  banReason: string;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];

  @OneToMany(() => BlogUserBan, (blogUserBan) => blogUserBan.blog)
  bannedInBlogs: BlogUserBan[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
