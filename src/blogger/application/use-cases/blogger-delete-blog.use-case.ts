import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class BloggerDeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BloggerDeleteBlogCommand)
export class BloggerDeleteBlogUseCase {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BloggerDeleteBlogCommand) {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (blog.blogOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized updating. This blog belongs to another user.',
      );
    }
    await this.blogsRepository.save(blog);
  }
}
