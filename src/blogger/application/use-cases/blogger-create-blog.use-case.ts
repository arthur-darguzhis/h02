import { CommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../../blogs/dto/createBlog.dto';
import { BlogsFactory } from '../../../blogs/blogs.factory';
import { BlogDocument } from '../../../blogs/blogs-schema';

export class BloggerCreateBlogCommand {
  constructor(public dto: CreateBlogDto, public userId: string) {}
}

@CommandHandler(BloggerCreateBlogCommand)
export class BloggerCreateBlogUseCase {
  constructor(private blogsFactory: BlogsFactory) {}

  async execute(command: BloggerCreateBlogCommand): Promise<BlogDocument> {
    return await this.blogsFactory.bloggerCreateBlog(
      command.dto,
      command.userId,
    );
  }
}
