import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CommentReaction,
  CommentReactionDocument,
} from './comment-reaction-schema';

@Injectable()
export class CommentReactionsRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionModel: Model<CommentReactionDocument>,
  ) {}

  async findUserReaction(commentId, userId) {
    return this.commentReactionModel.findOne({
      commentId: commentId,
      userId: userId,
    });
  }

  async save(
    userReaction: CommentReactionDocument,
  ): Promise<CommentReactionDocument> {
    return userReaction.save();
  }

  async calculateCountOfLikes(commentId: string) {
    return this.commentReactionModel.countDocuments({
      commentId: commentId,
      status: CommentReaction.LIKE_STATUS_OPTIONS.LIKE,
    });
  }

  async calculateCountOfDislikes(commentId: string) {
    return this.commentReactionModel.countDocuments({
      commentId: commentId,
      status: CommentReaction.LIKE_STATUS_OPTIONS.DISLIKE,
    });
  }
}
