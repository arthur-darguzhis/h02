import { Injectable } from '@nestjs/common';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerCreatePostCommand } from '../blogger/application/use-cases/blogger-create-post.use-case';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { Post } from './application/entities/post';

@Injectable()
export class PostsFactory {
  constructor(private blogsPgRepository: BlogsRepository) {}

  async bloggerCreatePostPg(command: BloggerCreatePostCommand) {
    const blog = await this.blogsPgRepository.getById(command.blogId);

    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized creating post. This blog belongs to another user.',
      );
    }

    const post = new Post();
    post.title = command.title;
    post.shortDescription = command.shortDescription;
    post.content = command.content;
    post.blogId = command.blogId;
    post.isBanned = false;
    post.createdAt = new Date();
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.newestLikes = [];
    post.userId = command.userId;

    return post;
  }
}
