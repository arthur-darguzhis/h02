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

  async save(comment: Comment) {
    await this.commentsRepository.save(comment);
  }

  async forTest_findOne(postId: string, userId: string) {
    return await this.commentsRepository
      .createQueryBuilder('comments')
      .where('comments.user_id = :userId', { userId })
      .andWhere('comments.post_id = :postId', { postId })
      .getOne();
  }

  async findById(commentId: any) {
    return await this.commentsRepository.findOneBy({ id: commentId });
  }

  async getById(commentId: any) {
    const comment = await this.findById(commentId);

    if (comment === null) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }

    return comment;
  }

  async delete(comment: Comment) {
    await this.commentsRepository.remove(comment);
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.commentsRepository
      .createQueryBuilder()
      .update(Comment)
      .set({ isBanned })
      .where('user_id = :userId', { userId: userId })
      .execute();
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
