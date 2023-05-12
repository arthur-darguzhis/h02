import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../../users/application/entities/user';
import { BlogUserBan } from './blog-user-ban';
import { Post } from '../../../posts/application/entities/post';
import { Image } from '../../../images/application/entity/image';

@Entity({ name: 'blogs' })
export class Blog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 15, collation: 'C', name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 500, collation: 'C', name: 'description' })
  description: string;

  @Column({ type: 'varchar', length: 100, collation: 'C', name: 'website_url' })
  websiteUrl: string;

  @Column({ type: 'boolean', name: 'is_membership', default: false })
  isMembership: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.blogs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'boolean', name: 'is_banned' })
  isBanned: boolean;

  @OneToMany(() => BlogUserBan, (blogUserBan) => blogUserBan.blog)
  bannedUsers: BlogUserBan[];

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'ban_date',
  })
  banDate: Date;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  @OneToOne(() => Image)
  @Column('uuid', { name: 'wallpaper', nullable: true })
  wallpaper: string;

  @OneToOne(() => Image)
  @Column('uuid', { name: 'main_image', nullable: true })
  mainImage: string;
}
