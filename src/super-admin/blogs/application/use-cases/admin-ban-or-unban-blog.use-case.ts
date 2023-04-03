import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPgRepository } from '../../../../posts/infrastructure/posts-pg.repository';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';

export class AdminBanOrUnbanBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly isBanned: boolean,
  ) {}
}

@CommandHandler(AdminBanOrUnbanBlogCommand)
export class AdminBanOrUnbanBlogUseCase implements ICommandHandler {
  constructor(
    private postsPgRepository: PostsPgRepository,
    private blogsPgRepository: BlogsPgRepository,
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
