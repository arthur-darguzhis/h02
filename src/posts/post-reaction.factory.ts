import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../users/users.repository';
import { PostReaction, PostReactionDocument } from './post-reaction-schema';
import { UsersPgRepository } from '../users/infrastructure/users.pg-repository';

@Injectable()
export class PostReactionsFactory {
  constructor(
    @InjectModel(PostReaction.name)
    private postReactionDocumentModel: Model<PostReactionDocument>,
    private usersRepository: UsersRepository,
    private usersPgRepository: UsersPgRepository,
  ) {}

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
    if (!Object.values(PostReaction.LIKE_STATUS_OPTIONS).includes(likeStatus)) {
      throw new UnprocessableEntityException(
        'Unknown status for user reaction on Post',
      );
    }
  }
}
