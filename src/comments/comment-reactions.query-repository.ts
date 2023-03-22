import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  CommentReactionDocument,
} from './comment-reaction-schema';
import { Model } from 'mongoose';

@Injectable()
export class CommentReactionsQueryRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionModel: Model<CommentReactionDocument>,
  ) {}

  async getUserReactionOnCommentsBatch(
    commentsIdList: Array<string>,
    userId: string,
  ): Promise<CommentReaction[]> {
    return this.commentReactionModel
      .find({
        commentId: { $in: commentsIdList },
        userId: userId,
        isBanned: false,
      })
      .lean();
  }

  async findUserReaction(commentId: string, userId) {
    return this.commentReactionModel
      .findOne({
        commentId: commentId,
        userId: userId,
      })
      .lean();
  }
}
