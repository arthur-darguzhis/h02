import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentReactionsPgRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async find(commentId: string, userId: string) {
    const commentReaction = await this.dataSource.query(
      `SELECT 
       id,
       user_id as userId,
       comment_id as commentId,
       status,
       created_at as createdAt,
       is_banned as isBanned
      FROM comment_reactions WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId],
    );

    return commentReaction[0] || null;
  }

  async updateStatus(userReactionId: string, status: string) {
    await this.dataSource.query(
      `UPDATE comment_reactions SET status = $1 WHERE id = $2`,
      [status, userReactionId],
    );
  }

  async calculateCountOfLikes(commentId: string) {
    const data = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM comment_reactions WHERE comment_id = $1 AND status = 'Like'`,
      [commentId],
    );

    return data[0].count || 0;
  }

  async calculateCountOfDislikes(commentId: string) {
    const data = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM comment_reactions WHERE comment_id = $1 AND status = 'Dislike'`,
      [commentId],
    );

    return data[0].count || 0;
  }

  async addCommentReaction(commentReaction: {
    createdAt: Date;
    commentId: string;
    isBanned: boolean;
    userId: string;
    status: string;
  }) {
    await this.dataSource.query(
      `INSERT INTO comment_reactions (user_id, comment_id, status, created_at, is_banned) VALUES ($1, $2, $3, $4, $5)`,
      [
        commentReaction.userId,
        commentReaction.commentId,
        commentReaction.status,
        commentReaction.createdAt,
        commentReaction.isBanned,
      ],
    );
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE comment_reactions SET is_banned = $1 WHERE user_id = $2`,
      [isBanned, userId],
    );
  }
}
