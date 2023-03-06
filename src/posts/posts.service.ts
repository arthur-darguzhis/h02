import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { PostsFactory } from './posts.factory';
import { PostsRepository } from './posts.repository';
import { UpdatePostDto } from './dto/updatePost.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsFactory: PostsFactory,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto) {
    const newPost = await this.postsFactory.createNewPost(dto);
    return this.postsRepository.save(newPost);
  }

  async updatePost(postId: string, dto: UpdatePostDto) {
    return this.postsRepository.updatePost(postId, dto);
  }

  async deletePost(postId: string) {
    return this.postsRepository.deleteById(postId);
  }
}
