import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
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
    private blogsPgRepository: BlogsRepository,
  ) {}
  async execute(command: AdminCreateBlogCommand) {
    console.log(command);
    const blog = this.blogsFactory.adminCreateBlog(
      command.name,
      command.description,
      command.websiteUrl,
    );

    return await this.blogsPgRepository.save(blog);
  }
}
