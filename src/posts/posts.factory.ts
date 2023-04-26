import { Injectable } from '@nestjs/common';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerCreatePostCommand } from '../blogger/application/use-cases/blogger-create-post.use-case';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';

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

    return {
      title: command.title,
      shortDescription: command.shortDescription,
      content: command.content,
      blogId: command.blogId,
      blogName: blog.name,
      isBanned: false,
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
      userId: command.userId,
    };
  }
}
