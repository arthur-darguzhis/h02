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
}
