import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsFactory } from '../../../blogs/blogs.factory';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

export class BloggerCreateBlogCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(BloggerCreateBlogCommand)
export class BloggerCreateBlogUseCase implements ICommandHandler {
  constructor(
    private blogsFactory: BlogsFactory,
    private blogsPgRepository: BlogsPgRepository,
  ) {}

  async execute(command: BloggerCreateBlogCommand) {
    const blog = this.blogsFactory.bloggerCreateBlogPg(
      command.name,
      command.description,
      command.websiteUrl,
      command.userId,
    );

    return await this.blogsPgRepository.saveNewBlog(blog);
  }
}
