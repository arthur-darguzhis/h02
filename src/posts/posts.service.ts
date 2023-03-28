import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './api/dto/createPost.dto';
import { PostsFactory } from './posts.factory';
import { PostsRepository } from './posts.repository';
import { UpdatePostDto } from './api/dto/updatePost.dto';
import { CommentReactionsDto } from '../comments/dto/comment-reactions.dto';
import { PostReactionsRepository } from './post-reactions.repository';
import { PostReactionsFactory } from './post-reaction.factory';

@Injectable()
export class PostsService {
  constructor(
    private postsFactory: PostsFactory,
    private postsRepository: PostsRepository,
    private postReactionsRepository: PostReactionsRepository,
    private postReactionsFactory: PostReactionsFactory,
  ) {}

  async createPost(dto: CreatePostDto) {
    const newPost = await this.postsFactory.adminCreatePost(dto);
    return this.postsRepository.save(newPost);
  }

  async updatePost(postId: string, dto: UpdatePostDto) {
    return this.postsRepository.updatePost(postId, dto);
  }

  async deletePost(postId: string) {
    return this.postsRepository.deleteById(postId);
  }

  async addReaction(postId: string, userId: string, dto: CommentReactionsDto) {
    await this.postsRepository.throwIfNotExists(postId);
    const userReaction = await this.postReactionsRepository.findUserReaction(
      postId,
      userId,
    );

    if (!userReaction) {
      await this.postReactionsFactory.createNewPostReaction(
        postId,
        userId,
        dto,
      );
    } else {
      if (userReaction.status === dto.likeStatus) {
        return true;
      }
      userReaction.status = dto.likeStatus;
      await this.postReactionsRepository.save(userReaction);
    }

    await this.updatePostReactionsCount(postId);
  }

  public async updatePostReactionsCount(postId: any) {
    const likesCount = await this.postReactionsRepository.calculateCountOfLikes(
      postId,
    );
    const dislikesCount =
      await this.postReactionsRepository.calculateCountOfDislikes(postId);
    const newestLikes =
      await this.postReactionsRepository.getNewestLikesOnThePost(postId);
    await this.postsRepository.updateLikesInfo(
      postId,
      likesCount,
      dislikesCount,
      newestLikes,
    );
  }
}
