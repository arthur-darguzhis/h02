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
import { PostsService } from '../../../posts/posts.service';
import { CommentsService } from '../../../comments/comments.service';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { UserSessionsPgRepository } from '../../../security/user-sessions-pg.repository';

export class AdminBanOrUnbanUserCommand {
  constructor(
    public readonly userId: string,
    public readonly isBanned: boolean,
    public readonly banReason: string,
  ) {}
}

@CommandHandler(AdminBanOrUnbanUserCommand)
export class AdminBanOrUnbanUserUseCase {
  constructor(
    private usersPgRepository: UsersPgRepository,
    private userSessionsRepository: UserSessionsRepository,
    private userSessionsPgRepository: UserSessionsPgRepository, // private blogsRepository: BlogsRepository, // private postsRepository: PostsRepository, // private commentsRepository: CommentsRepository, // private postReactionsRepository: PostReactionsRepository, // private commentReactionsRepository: CommentReactionsRepository, // private postsService: PostsService, // private commentsService: CommentsService,
  ) {}
  async execute(command: AdminBanOrUnbanUserCommand) {
    const user = await this.usersPgRepository.getById(command.userId);
    if (command.isBanned === user.isBanned) {
      if (command.isBanned) {
        throw new UnprocessableEntityException('The user is already banned');
      } else {
        throw new UnprocessableEntityException('The user is already active');
      }
    }

    const banDate = command.isBanned ? new Date() : null;
    const banReason = command.isBanned ? command.banReason : null;

    if (command.isBanned) {
      await this.userSessionsPgRepository.deleteAllSessionsByUserId(
        command.userId,
      );
    }

    await this.usersPgRepository.banUnbanUser(
      command.userId,
      command.isBanned,
      banDate,
      banReason,
    );

    // await Promise.allSettled([
    //   this.usersRepository.save(user),
    //   this.blogsRepository.setBanStatusByUserId(
    //     command.userId,
    //     command.dto.isBanned,
    //   ),
    //   this.postsRepository.setBanStatusByUserId(
    //     command.userId,
    //     command.dto.isBanned,
    //   ),
    //   this.commentsRepository.setBanStatusByUserId(
    //     command.userId,
    //     command.dto.isBanned,
    //   ),
    //   this.postReactionsRepository.setBanStatusByUserId(
    //     command.userId,
    //     command.dto.isBanned,
    //   ),
    //   this.commentReactionsRepository.setBanStatusByUserId(
    //     command.userId,
    //     command.dto.isBanned,
    //   ),
    // ]);

    // await this.recalculatePostsAndCommentsReactionWithUserId(command.userId);
  }

  // private async recalculatePostsAndCommentsReactionWithUserId(userId: string) {
  //   const postIdListToRecalculateLikes =
  //     await this.postReactionsRepository.getPostIdListWhereUserId(userId);
  //
  //   const promisesToRecalculatePostsReactions =
  //     postIdListToRecalculateLikes.map((post) => {
  //       return this.postsService.updatePostReactionsCount(post.id);
  //     });
  //
  //   const commentIdListToRecalculateLikes =
  //     await this.commentReactionsRepository.getCommentIdListWhereUserId(userId);
  //
  //   const promisesToRecalculateCommentsReactions =
  //     commentIdListToRecalculateLikes.map((comment) => {
  //       return this.commentsService.updateCommentReactionsCount(comment.id);
  //     });
  //
  //   return await Promise.allSettled([
  //     ...promisesToRecalculatePostsReactions,
  //     ...promisesToRecalculateCommentsReactions,
  //   ]);
  // }
}
