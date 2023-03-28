import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/posts.repository';

export class AdminBanOrUnbanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(AdminBanOrUnbanBlogCommand)
export class AdminBanOrUnbanBlogUseCase implements ICommandHandler {
  constructor(
    private postsRepository: PostsRepository, //TODO inject here necessary services
  ) {}
  async execute(command: AdminBanOrUnbanBlogCommand) {
    await this.postsRepository.setBanStatusByBlogId(
      command.blogId,
      command.isBanned,
    );
  }
}
