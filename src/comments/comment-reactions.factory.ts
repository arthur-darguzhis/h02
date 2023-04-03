import { Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';

@Injectable()
export class CommentReactionsFactory {
  constructor(private usersPgRepository: UsersPgRepository) {}

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
      !Object.values({
        NONE: 'None',
        LIKE: 'Like',
        DISLIKE: 'Dislike',
      }).includes(likeStatus)
      // !Object.values(CommentReaction.LIKE_STATUS_OPTIONS).includes(likeStatus)
      // public static readonly LIKE_STATUS_OPTIONS = {
      //   NONE: 'None',
      //   LIKE: 'Like',
      //   DISLIKE: 'Dislike',
      // };
    ) {
      throw new UnprocessableEntityException(
        'Unknown status for user reaction on Post',
      );
    }
  }
}
