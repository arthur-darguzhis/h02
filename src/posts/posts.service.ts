import { Injectable } from '@nestjs/common';
import { CreatePostDTO } from './dto/createPostDTO';
import { PostsFactory } from './posts.factory';
import { PostsRepository } from './posts.repository';
import { UpdatePostDTO } from './dto/updatePostDTO';

@Injectable()
export class PostsService {
  constructor(
    private postsFactory: PostsFactory,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDTO) {
    const newPost = await this.postsFactory.createNewPost(dto);
    return this.postsRepository.save(newPost);
  }

  async updatePost(postId: string, dto: UpdatePostDTO) {
    return this.postsRepository.updatePost(postId, dto);
  }

  async deletePost(postId: string) {
    return this.postsRepository.deleteById(postId);
  }
}
