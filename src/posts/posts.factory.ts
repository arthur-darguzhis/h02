import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerCreatePostCommand } from '../blogger/application/use-cases/blogger-create-post';

@Injectable()
export class PostsFactory {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsRepository: BlogsRepository,
  ) {}

  async adminCreatePost(dto: CreatePostDto): Promise<PostDocument | never> {
    const blog = await this.blogsRepository.getById(dto.blogId);

    return await this.postModel.create({
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

  async bloggerCreatePost(
    dto: BloggerCreatePostCommand,
  ): Promise<PostDocument | never> {
    const blog = await this.blogsRepository.getById(dto.blogId);

    if (blog.blogOwnerInfo.userId !== dto.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized creating post. This blog belongs to another user.',
      );
    }

    return await this.postModel.create({
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
      postOwnerInfo: {
        userId: dto.userId,
      },
      createdAt: new Date().toISOString(),
    });
  }
}
