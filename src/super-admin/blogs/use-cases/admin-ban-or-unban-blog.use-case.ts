import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class AdminBanOrUnbanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(AdminBanOrUnbanBlogCommand)
export class AdminBanOrUnbanBlogUseCase implements ICommandHandler {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: AdminBanOrUnbanBlogCommand) {
    const blog = await this.blogsRepository.getById(command.blogId);
    await this.postsRepository.setBanStatusByBlogId(blog.id, command.isBanned);
  }
}
