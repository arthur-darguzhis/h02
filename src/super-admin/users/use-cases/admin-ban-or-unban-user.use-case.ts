import { CommandHandler } from '@nestjs/cqrs';
import { AdminBanOrUnbanUserDto } from '../api/dto/admin-ban-or-unban-user.dto';
import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { PostReactionsRepository } from '../../../posts/post-reactions.repository';
import { CommentReactionsRepository } from '../../../comments/comment-reactions.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { UserSessionsRepository } from '../../../security/user-sessions.repository';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

export class AdminBanOrUnbanUserCommand {
  constructor(
    public userId: string,
    public dto: AdminBanOrUnbanUserDto, //TODO put here validated dto from HTTP request,
  ) {}
}

@CommandHandler(AdminBanOrUnbanUserCommand)
export class AdminBanOrUnbanUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private userSessionsRepository: UserSessionsRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private postReactionsRepository: PostReactionsRepository,
    private commentReactionsRepository: CommentReactionsRepository,
  ) {}
  async execute(command: AdminBanOrUnbanUserCommand) {
    const user = await this.usersRepository.getById(command.userId);
    if (command.dto.isBanned === user.banInfo.isBanned) {
      if (command.dto.isBanned) {
        throw new UnprocessableEntityException('The user is already banned');
      } else {
        throw new UnprocessableEntityException('The user is already active');
      }
    }

    user.banInfo.isBanned = command.dto.isBanned;
    user.banInfo.banDate = new Date().toISOString();
    user.banInfo.banReason = command.dto.banReason;

    if (command.dto.isBanned) {
      await this.userSessionsRepository.deleteAllSessionsByUserId(
        command.userId,
      );
    }

    await Promise.allSettled([
      this.usersRepository.save(user),
      this.blogsRepository.setBanStatusByUserId(
        command.userId,
        command.dto.isBanned,
      ),
      this.postsRepository.setBanStatusByUserId(
        command.userId,
        command.dto.isBanned,
      ),
      this.commentsRepository.setBanStatusByUserId(
        command.userId,
        command.dto.isBanned,
      ),
      this.postReactionsRepository.setBanStatusByUserId(
        command.userId,
        command.dto.isBanned,
      ),
      this.commentReactionsRepository.setBanStatusByUserId(
        command.userId,
        command.dto.isBanned,
      ),
    ]);
  }
}
