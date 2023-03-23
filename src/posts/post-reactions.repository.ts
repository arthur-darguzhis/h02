import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReaction, PostReactionDocument } from './post-reaction-schema';

@Injectable()
export class PostReactionsRepository {
  constructor(
    @InjectModel(PostReaction.name)
    private postReactionModel: Model<PostReactionDocument>,
  ) {}

  async findUserReaction(postId, userId): Promise<PostReactionDocument | null> {
    return this.postReactionModel.findOne({
      postId: postId,
      userId: userId,
    });
  }

  async save(
    userReaction: PostReactionDocument,
  ): Promise<PostReactionDocument> {
    return userReaction.save();
  }

  async calculateCountOfLikes(postId: string) {
    return this.postReactionModel.countDocuments({
      postId: postId,
      status: PostReaction.LIKE_STATUS_OPTIONS.LIKE,
      isBanned: false,
    });
  }

  async calculateCountOfDislikes(postId: string) {
    return this.postReactionModel.countDocuments({
      postId: postId,
      status: PostReaction.LIKE_STATUS_OPTIONS.DISLIKE,
      isBanned: false,
    });
  }

  async getNewestLikesOnThePost(postId: any) {
    return this.postReactionModel
      .find({
        postId: postId,
        status: PostReaction.LIKE_STATUS_OPTIONS.LIKE,
      })
      .select('-_id addedAt userId login')
      .sort({ addedAt: 'desc' })
      .limit(3)
      .lean();
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.postReactionModel.updateMany(
      { userId: userId },
      { $set: { isBanned } },
    );
  }
}
