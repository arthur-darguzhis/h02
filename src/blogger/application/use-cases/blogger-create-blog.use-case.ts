import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsFactory } from '../../../blogs/blogs.factory';
import { BlogDocument } from '../../../blogs/blogs-schema';

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
  constructor(private blogsFactory: BlogsFactory) {}

  async execute(command: BloggerCreateBlogCommand): Promise<BlogDocument> {
    return await this.blogsFactory.bloggerCreateBlog(command);
  }
}
