import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentReaction } from '../application/entities/comment-reaction';
import { LikeStatus } from '../../common/pgTypes/enum/likeStatus';

@Injectable()
export class CommentReactionsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(CommentReaction)
    private commentReactionsRepository: Repository<CommentReaction>,
  ) {}

  async find(commentId: string, userId: string) {
    return await this.commentReactionsRepository.findOneBy({
      commentId,
      userId,
    });
  }

  async save(commentReaction: CommentReaction) {
    return await this.commentReactionsRepository.save(commentReaction);
  }

  async calculateCountOfLikes(commentId: string) {
    return await this.commentReactionsRepository.countBy({
      commentId: commentId,
      status: LikeStatus.Like,
      isBanned: false,
    });
  }

  async calculateCountOfDislikes(commentId: string) {
    return await this.commentReactionsRepository.countBy({
      commentId: commentId,
      status: LikeStatus.Dislike,
      isBanned: false,
    });
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.commentReactionsRepository
      .createQueryBuilder()
      .update(CommentReaction)
      .set({ isBanned })
      .where('user_id = :userId', { userId: userId })
      .execute();
  }
}
