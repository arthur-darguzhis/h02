import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReaction, PostReactionDocument } from './post-reaction-schema';

@Injectable()
export class PostReactionsQueryRepository {
  constructor(
    @InjectModel(PostReaction.name)
    private postReactionModel: Model<PostReactionDocument>,
  ) {}

  async getUserReactionOnPostBatch(
    postsIdList: Array<string>,
    userId: string,
  ): Promise<PostReaction[]> {
    return this.postReactionModel
      .find({ postId: { $in: postsIdList }, userId: userId })
      .lean();
  }

  async findUserReaction(postId: string, userId: any) {
    return this.postReactionModel
      .findOne({
        postId: postId,
        userId: userId,
      })
      .lean();
  }
}
