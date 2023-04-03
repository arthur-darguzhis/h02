import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

export class BloggerUpdateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUpdateBlogCommand)
export class BloggerUpdateBlogUseCase {
  constructor(private blogsPgRepository: BlogsPgRepository) {}

  async execute(command: BloggerUpdateBlogCommand) {
    console.log(command);
    const blog = await this.blogsPgRepository.getById(command.blogId);
    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized updating. This blog belongs to another user.',
      );
    }
    blog.name = command.name;
    blog.description = command.description;
    blog.websiteUrl = command.websiteUrl;
    await this.blogsPgRepository.update(blog);
  }
}
