import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { mapPostToViewModel } from './posts.mapper';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';
import { PostReaction } from './post-reaction-schema';
import { PostReactionsQueryRepository } from './post-reactions.query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsQueryRepository: BlogsQueryRepository,
    private postReactionsQueryRepository: PostReactionsQueryRepository,
  ) {}

  async getById(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return mapPostToViewModel(post);
  }

  async getByIdForCurrentUser(postId: string, currentUserId = null) {
    const post = await this.postModel.findById(postId);
    if (!post || post.isBanned) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }

    let myStatus = PostReaction.LIKE_STATUS_OPTIONS.NONE;
    if (currentUserId) {
      const myReaction =
        await this.postReactionsQueryRepository.findUserReaction(
          postId,
          currentUserId,
        );
      if (myReaction) {
        myStatus = myReaction.status;
      }
    }

    return mapPostToViewModel(post, myStatus);
  }
}
