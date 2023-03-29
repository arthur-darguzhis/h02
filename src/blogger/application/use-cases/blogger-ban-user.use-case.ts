import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UsersRepository } from '../../../users/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogUserBans,
  BlogUserBansDocument,
} from '../../../blogs/blog-user-bans-schema';
import { BlogUserBansRepository } from '../../../blogs/blog-user-bans.repository';

export class BloggerBanUserCommand {
  constructor(
    public bloggerId: string,
    public blogId: string,
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    @InjectModel(BlogUserBans.name)
    private blogUserBansDocument: Model<BlogUserBansDocument>,
    private blogUserBansRepository: BlogUserBansRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute(command: BloggerBanUserCommand): Promise<void | never> {
    const blog = await this.blogsRepository.getById(command.blogId);
    const user = await this.usersRepository.getById(command.userId);
    if (blog.blogOwnerInfo.userId !== command.bloggerId) {
      throw new UnauthorizedActionException(
        'Unauthorized action. This blog belongs to another blogger.',
      );
    }

    const blogUserBan = await this.blogUserBansRepository.findOne(
      command.blogId,
      command.userId,
    );

    if (blogUserBan && blogUserBan.banInfo.isBanned === command.isBanned) {
      throw new UnauthorizedActionException(
        'User is already banned for this blog',
      );
    }

    if (command.isBanned) {
      await this.blogUserBansDocument.create({
        blogId: blog.id,
        userId: user.id,
        login: user.login,
        banInfo: {
          isBanned: true,
          banDate: new Date().toISOString(),
          banReason: command.banReason,
        },
      });
    } else {
      blogUserBan.banInfo.isBanned = false;
      blogUserBan.banInfo.banDate = null;
      blogUserBan.banInfo.banReason = null;
      await this.blogUserBansRepository.save(blogUserBan);
    }
  }
}
