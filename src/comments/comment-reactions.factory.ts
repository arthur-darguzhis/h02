import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  CommentReactionDocument,
} from './comment-reaction-schema';
import { Model } from 'mongoose';
import { CommentReactionsDto } from './dto/comment-reactions.dto';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CommentReactionsFactory {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionDocumentModel: Model<CommentReactionDocument>,
    private usersRepository: UsersRepository,
  ) {}

  async createNewCommentReaction(
    commentId: string,
    userId: string,
    dto: CommentReactionsDto,
  ): Promise<CommentReactionDocument | never> {
    const user = await this.usersRepository.getById(userId);
    this.throwIfReactionStatusIsNotCorrect(dto.likeStatus);

    return this.commentReactionDocumentModel.create({
      userId: userId,
      commentId: commentId,
      login: user.login,
      status: dto.likeStatus,
      createdAt: new Date().toISOString(),
    });
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
