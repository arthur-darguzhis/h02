import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';

export class AdminBanOrUnbanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(AdminBanOrUnbanBlogCommand)
export class AdminBanOrUnbanBlogUseCase implements ICommandHandler {
  constructor(
    private postsPgRepository: PostsRepository,
    private blogsPgRepository: BlogsRepository,
  ) {}
  async execute(command: AdminBanOrUnbanBlogCommand) {
    console.log(command);
    await this.blogsPgRepository.throwIfNotExists(command.blogId);
    await this.postsPgRepository.setBanStatusByBlogId(
      command.blogId,
      command.isBanned,
    );
  }
}
