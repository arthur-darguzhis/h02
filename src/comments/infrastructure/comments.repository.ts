import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Comment } from '../application/entities/comment';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async saveNewComment(comment: {
    createdAt: Date;
    likesCount: number;
    dislikesCount: number;
    isBanned: boolean;
    postId: any;
    userId: any;
    content: any;
  }) {
    const sql = `
        INSERT INTO comments 
            (content, post_id, user_id, is_banned, created_at, likes_count, dislikes_count) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`;

    const result = await this.dataSource.query(sql, [
      comment.content,
      comment.postId,
      comment.userId,
      comment.isBanned,
      comment.createdAt,
      comment.likesCount,
      comment.dislikesCount,
    ]);

    return result[0].id;
  }

  async forTest_findOne(postId: string, userId: string) {
    const comment = await this.dataSource.query(
      `SELECT 
       id,
       content,
       post_id AS "postId",
       is_banned AS "isBanned",
       created_at AS "createdAt",
       user_id AS "userId",
       likes_count AS "likesCount",
       dislikes_count AS "dislikesCount"
        FROM comments WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );

    return comment[0] || null;
  }

  async findById(commentId: any) {
    const comment = await this.dataSource.query(
      `SELECT 
       id,
       content,
       post_id AS "postId",
       is_banned AS "isBanned",
       created_at AS "createdAt",
       user_id AS "userId",
       likes_count AS "likesCount",
       dislikes_count AS "dislikesCount"
        FROM comments WHERE id = $1`,
      [commentId],
    );

    return comment[0] || null;
  }

  async getById(commentId: any) {
    const comment = await this.findById(commentId);

    if (!comment) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }

    return comment;
  }

  async delete(commentId: string) {
    await this.dataSource.query(`DELETE FROM comments WHERE id = $1`, [
      commentId,
    ]);
  }

  async update(comment: any) {
    await this.dataSource.query(
      `UPDATE comments SET content = $1 WHERE id = $2`,
      [comment.content, comment.id],
    );
  }

  async throwIfNotExists(commentId: string) {
    const comment = await this.findById(commentId);

    if (!comment) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }
  }

  async updateLikesInfo(
    commentId: string,
    likesCount: any,
    dislikesCount: any,
  ) {
    await this.dataSource.query(
      `UPDATE comments SET likes_count = $1, dislikes_count = $2 WHERE id = $3`,
      [likesCount, dislikesCount, commentId],
    );
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE comments SET is_banned = $1 WHERE user_id = $2`,
      [isBanned, userId],
    );
  }

  async recalculateCommentReactionsAfterUserBan(userId: string) {
    await this.dataSource.query(
      `UPDATE comments SET 
                likes_count = (SELECT COUNT(*) FROM comment_reactions as cr WHERE cr.comment_id = comments.id AND status = 'Like' AND cr.is_banned = false),
                dislikes_count = (SELECT COUNT(*) FROM comment_reactions as cr WHERE cr.comment_id = comments.id AND status = 'Dislike' AND cr.is_banned = false)
             WHERE comments.id IN (SELECT comment_id FROM comment_reactions WHERE comment_reactions.user_id = $1)`,
      [userId],
    );
  }
}
