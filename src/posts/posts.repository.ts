import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { UpdatePostDto } from './dto/updatePost.dto';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getById(postId: string): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${post} is not found`);
    }
    return post;
  }

  async save(postModel: PostDocument): Promise<PostDocument> {
    return postModel.save();
  }

  async updatePost(postId: string, dto: UpdatePostDto): Promise<true | never> {
    const isUpdated = await this.postModel.findByIdAndUpdate(postId, dto, {
      new: true,
    });
    if (!isUpdated) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return true;
  }

  async deleteById(postId: string): Promise<true | never> {
    const isRemoved = await this.postModel.findByIdAndRemove(postId);

    if (!isRemoved) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return true;
  }

  async throwIfNotExists(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${post} is not found`);
    }
  }

  async updateLikesInfo(
    postId: string,
    likesCount: number,
    dislikeCount: number,
    newestLikes: any,
  ): Promise<boolean> {
    const result = await this.postModel.updateOne(
      { _id: postId },
      {
        $set: {
          'extendedLikesInfo.likesCount': likesCount,
          'extendedLikesInfo.dislikesCount': dislikeCount,
          'extendedLikesInfo.newestLikes': newestLikes,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async setBanStatusByUserId(userId: string, isBanned: boolean) {
    await this.postModel.updateMany(
      { 'postOwnerInfo.userId': userId },
      { $set: { isBanned } },
    );
  }
}
