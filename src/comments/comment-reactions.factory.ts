import { Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { CommentReaction } from './application/entities/comment-reaction';

@Injectable()
export class CommentReactionsFactory {
  constructor(private usersPgRepository: UsersRepository) {}

  async createNewCommentReaction(
    commentId: string,
    userId: string,
    likeStatus: string,
  ) {
    await this.usersPgRepository.throwIfUserIsNotExists(userId);
    this.throwIfReactionStatusIsNotCorrect(likeStatus);

    const commentReaction = new CommentReaction();
    commentReaction.userId = userId;
    commentReaction.commentId = commentId;
    commentReaction.status = likeStatus;
    commentReaction.createdAt = new Date();
    commentReaction.isBanned = false;

    return commentReaction;
  }

  private throwIfReactionStatusIsNotCorrect(likeStatus: string) {
    if (
      !Object.values({
        NONE: 'None',
        LIKE: 'Like',
        DISLIKE: 'Dislike',
      }).includes(likeStatus)
    ) {
      throw new UnprocessableEntityException(
        'Unknown status for user reaction on Post',
      );
    }
  }
}
