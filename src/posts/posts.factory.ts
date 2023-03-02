import { Injectable } from '@nestjs/common';
import { CreatePostDTO } from './dto/createPostDTO';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsFactory {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsRepository: BlogsRepository,
  ) {}
  async createNewPost(dto: CreatePostDTO): Promise<PostDocument | never> {
    const blog = await this.blogsRepository.getById(dto.blogId);

    return this.postModel.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      },
      createdAt: new Date().toISOString(),
    });
  }
}
