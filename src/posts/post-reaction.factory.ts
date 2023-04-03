import { Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';

@Injectable()
export class PostReactionsFactory {
  constructor(private usersPgRepository: UsersPgRepository) {}

  async createNewPostReaction(
    postId: string,
    userId: string,
    likeStatus: string,
  ) {
    await this.usersPgRepository.throwIfUserIsNotExists(userId);
    this.throwIfReactionStatusIsNotCorrect(likeStatus);

    return {
      userId: userId,
      postId: postId,
      status: likeStatus,
      createdAt: new Date(),
      isBanned: false,
    };
  }

  private throwIfReactionStatusIsNotCorrect(likeStatus: string) {
    // if (!Object.values(PostReaction.LIKE_STATUS_OPTIONS).includes(likeStatus)) {
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
