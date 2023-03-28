import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../users/users.repository';
import { PostReaction, PostReactionDocument } from './post-reaction-schema';
import { PostReactionsDto } from './api/dto/post-reactions.dto';

@Injectable()
export class PostReactionsFactory {
  constructor(
    @InjectModel(PostReaction.name)
    private postReactionDocumentModel: Model<PostReactionDocument>,
    private usersRepository: UsersRepository,
  ) {}

  async createNewPostReaction(
    postId: string,
    userId: string,
    dto: PostReactionsDto,
  ): Promise<PostReactionDocument | never> {
    const user = await this.usersRepository.getById(userId);
    this.throwIfReactionStatusIsNotCorrect(dto.likeStatus);

    return this.postReactionDocumentModel.create({
      userId: userId,
      postId: postId,
      login: user.login,
      status: dto.likeStatus,
      addedAt: new Date().toISOString(),
    });
  }

  private throwIfReactionStatusIsNotCorrect(likeStatus: string) {
    if (!Object.values(PostReaction.LIKE_STATUS_OPTIONS).includes(likeStatus)) {
      throw new UnprocessableEntityException(
        'Unknown status for user reaction on Post',
      );
    }
  }
}
