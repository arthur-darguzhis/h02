import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { BlogUserBanRepository } from '../../../blogs/infrastructure/blog-user-ban.repository';
import { BlogUsersBanFactory } from '../../../users/blog-users-ban.factory';

export class BloggerBanUserCommand {
  constructor(
    public bloggerId: string,
    public blogId: string,
    public userId: string,
    public isBanned: boolean = false,
    public banReason: string,
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    private blogsPgRepository: BlogsPgRepository,
    private usersPgRepository: UsersRepository,
    private blogUserBanRepository: BlogUserBanRepository,
    private blogUsersBanFactory: BlogUsersBanFactory,
  ) {}
  async execute(command: BloggerBanUserCommand): Promise<void | never> {
    console.log(command);
    await this.usersPgRepository.throwIfUserIsNotExists(command.userId);
    const blog = await this.blogsPgRepository.getById(command.blogId);
    if (blog.userId !== command.bloggerId) {
      throw new UnauthorizedActionException(
        'Unauthorized action. This blog belongs to another blogger.',
      );
    }

    const blogUserBan = await this.blogUserBanRepository.findOne(
      command.blogId,
      command.userId,
    );

    if (blogUserBan && blogUserBan.isBanned === command.isBanned) {
      throw new UnauthorizedActionException(
        'User is already banned for this blog',
      );
    }

    if (command.isBanned == false && !blogUserBan) {
      return;
    }

    if (blogUserBan) {
      await this.blogUserBanRepository.banOrUnban(blogUserBan);
    } else {
      const newUserBan = this.blogUsersBanFactory.createBlogUserBan(
        command.blogId,
        command.userId,
        command.banReason,
      );
      await this.blogUserBanRepository.save(newUserBan);
    }
  }
}
