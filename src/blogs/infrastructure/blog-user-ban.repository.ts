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
    const banInfo = await this.dataSource.query(
      `SELECT 
          id,
          blog_id as "blogId",
          user_id as "userId",
          is_banned as "isBanned",
          ban_date as "banDate",
          ban_reason as "banReason"
        FROM blog_user_ban WHERE blog_id = $1 AND user_id = $2`,
      [blogId, userId],
    );

    return banInfo[0] || null;
  }

  async banOrUnban(blogUserBan: any) {
    await this.dataSource.query(
      `UPDATE blog_user_ban SET is_banned = $1, ban_date = $2, ban_reason = $3 WHERE id = $4`,
      [
        blogUserBan.isBanned,
        blogUserBan.banDate,
        blogUserBan.banReason,
        blogUserBan.id,
      ],
    );
  }

  async save(newUserBan) {
    await this.dataSource.query(
      `INSERT INTO blog_user_ban (blog_id, user_id, is_banned, ban_date, ban_reason) VALUES ($1, $2, $3, $4, $5)`,
      [
        newUserBan.blogId,
        newUserBan.userId,
        newUserBan.isBanned,
        newUserBan.banDate,
        newUserBan.banReason,
      ],
    );
  }
}
