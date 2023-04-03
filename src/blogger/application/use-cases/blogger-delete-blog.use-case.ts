import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

export class BloggerDeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BloggerDeleteBlogCommand)
export class BloggerDeleteBlogUseCase {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsPgRepository: BlogsPgRepository,
  ) {}

  async execute(command: BloggerDeleteBlogCommand) {
    console.log(command);
    const blog = await this.blogsPgRepository.getById(command.blogId);
    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This blog belongs to another user.',
      );
    }
    await this.blogsPgRepository.delete(command.blogId, command.userId);
  }
}
