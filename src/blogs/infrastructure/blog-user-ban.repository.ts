import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BlogUserBan } from '../application/entities/blog-user-ban';

@Injectable()
export class BlogUserBanRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogUserBan)
    private blogUserBansRepository: Repository<BlogUserBan>,
  ) {}

  async findOne(blogId: string, userId: string) {
    return await this.blogUserBansRepository
      .createQueryBuilder('blog_user_ban')
      .where('blog_user_ban.blog_id = :blogId', { blogId })
      .andWhere('blog_user_ban.user_id = :userId', { userId })
      .getOne();
  }

  async save(blogUserBan: BlogUserBan) {
    await this.blogUserBansRepository.save(blogUserBan);
  }
}
