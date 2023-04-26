import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class BloggerDeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BloggerDeleteBlogCommand)
export class BloggerDeleteBlogUseCase {
  constructor(private blogsPgRepository: BlogsRepository) {}

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
