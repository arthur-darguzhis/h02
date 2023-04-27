import { Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { PostReaction } from './application/entities/post-reaction';

@Injectable()
export class PostReactionsFactory {
  constructor(private usersPgRepository: UsersRepository) {}

  async createNewPostReaction(
    postId: string,
    userId: string,
    likeStatus: string,
  ) {
    await this.usersPgRepository.throwIfUserIsNotExists(userId);
    this.throwIfReactionStatusIsNotCorrect(likeStatus);

    const postReaction = new PostReaction();

    postReaction.userId = userId;
    postReaction.postId = postId;
    postReaction.status = likeStatus;
    postReaction.createdAt = new Date();
    postReaction.isBanned = false;

    return postReaction;
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
