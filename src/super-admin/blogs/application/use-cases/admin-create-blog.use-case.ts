import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { BlogsFactory } from '../../../../blogs/blogs.factory';

export class AdminCreateBlogCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly websiteUrl: string,
  ) {}
}

@CommandHandler(AdminCreateBlogCommand)
export class AdminCreateBlogUseCase implements ICommandHandler {
  constructor(
    private blogsFactory: BlogsFactory,
    private blogsPgRepository: BlogsPgRepository,
  ) {}
  async execute(command: AdminCreateBlogCommand) {
    console.log(command);
    const blog = this.blogsFactory.adminCreateBlogPg(
      command.name,
      command.description,
      command.websiteUrl,
    );

    return await this.blogsPgRepository.saveNewBlog(blog);
  }
}
