import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PostReaction } from '../application/entities/post-reaction';

@Injectable()
export class PostsReactionsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostReaction)
    private postsReactionsRepository: Repository<PostReaction>,
  ) {}

  async findUserReaction(postId: string, userId: string) {
    const userReaction = await this.dataSource.query(
      `SELECT id,
       user_id as "userId",
       post_id as "postId",
       status, 
       is_banned as "isBanned",
       created_at as "createdAt"
    FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );

    return userReaction[0] || null;
  }

  async updateStatus(id: string, status: string) {
    await this.dataSource.query(
      `UPDATE post_reactions SET status = $1 WHERE id = $2`,
      [status, id],
    );
  }

  async calculateCountOfLikes(postId: string) {
    const data = await this.dataSource.query(
      `SELECT COUNT(*) as count 
                FROM post_reactions 
             WHERE post_id = $1 AND status = 'Like' AND is_banned = false`,
      [postId],
    );

    return data[0].count || 0;
  }

  async calculateCountOfDislikes(postId: string) {
    const data = await this.dataSource.query(
      `SELECT COUNT(*) as count 
                FROM post_reactions 
            WHERE post_id = $1 AND status = 'Dislike' AND is_banned = false`,
      [postId],
    );

    return data[0].count || 0;
  }

  async getNewestLikesOnThePost(postId: string) {
    return await this.dataSource.query(
      `SELECT p.created_at as "addedAt", 
                p.user_id as "userId",  
                u.login as "login"
              FROM post_reactions as p
                LEFT JOIN users u on p.user_id = u.id 
              WHERE post_id = $1 AND status = 'Like'
              ORDER BY p.created_at DESC 
              LIMIT 3`,
      [postId],
    );
  }

  async addPostReaction(userReaction: {
    createdAt: Date;
    isBanned: boolean;
    postId: string;
    userId: string;
    status: string;
  }) {
    return await this.dataSource.query(
      `INSERT INTO post_reactions (user_id, post_id, status, is_banned, created_at) 
            VALUES ($1, $2, $3, $4, $5)`,
      [
        userReaction.userId,
        userReaction.postId,
        userReaction.status,
        userReaction.isBanned,
        userReaction.createdAt,
      ],
    );
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE post_reactions SET is_banned = $1 WHERE user_id = $2`,
      [isBanned, userId],
    );
  }
}
