import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  CommentReactionDocument,
} from './comment-reaction-schema';
import { Model } from 'mongoose';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';

@Injectable()
export class CommentReactionsFactory {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionDocumentModel: Model<CommentReactionDocument>,
    private usersPgRepository: UsersPgRepository,
  ) {}

  async createNewCommentReaction(
    commentId: string,
    userId: string,
    likeStatus: string,
  ) {
    await this.usersPgRepository.throwIfUserIsNotExists(userId);
    this.throwIfReactionStatusIsNotCorrect(likeStatus);

    return {
      userId: userId,
      commentId: commentId,
      status: likeStatus,
      createdAt: new Date(),
      isBanned: false,
    };
  }

  private throwIfReactionStatusIsNotCorrect(likeStatus: string) {
    if (
      !Object.values(CommentReaction.LIKE_STATUS_OPTIONS).includes(likeStatus)
    ) {
      throw new UnprocessableEntityException(
        'Unknown status for user reaction on Post',
      );
    }
  }
}
