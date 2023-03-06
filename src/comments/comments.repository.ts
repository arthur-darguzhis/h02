import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }
    return comment;
  }

  //TODO где то еще обязательно нужны такие методы. при рефакторинге подмечать и добавлять в другие репозитории.
  async throwIfNotExists(commentId: string): Promise<void | never> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }
  }

  async deleteById(commentId: string) {
    const isRemoved = await this.commentModel.findByIdAndRemove(commentId);

    if (!isRemoved) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }
  }

  async save(commentModel: CommentDocument): Promise<CommentDocument> {
    return commentModel.save();
  }

  async updateLikesInfo(
    commentId: string,
    likesCount: number,
    dislikesCount: number,
  ): Promise<boolean> {
    const result = await this.commentModel.updateOne(
      { _id: commentId },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikesCount,
        },
      },
    );
    return result.modifiedCount === 1;
  }
}
