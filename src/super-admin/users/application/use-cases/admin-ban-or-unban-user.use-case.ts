import { CommandHandler } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { UserSessionsRepository } from '../../../../security/infrastructure/user-sessions.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';
import { PostsReactionsRepository } from '../../../../posts/infrastructure/posts-reactions.repository';
import { CommentReactionsRepository } from '../../../../comments/infrastructure/comment-reactions.repository';

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
    private usersPgRepository: UsersRepository,
    private userSessionsPgRepository: UserSessionsRepository,
    private blogsPgRepository: BlogsRepository,
    private postsPgRepository: PostsRepository,
    private commentsPgRepository: CommentsRepository,
    private postsReactionsPgRepository: PostsReactionsRepository,
    private commentReactionsPgRepository: CommentReactionsRepository,
  ) {}
  async execute(command: AdminBanOrUnbanUserCommand) {
    console.log(command);
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

    await Promise.allSettled([
      this.usersPgRepository.banUnbanUser(
        command.userId,
        command.isBanned,
        banDate,
        banReason,
      ),
      this.blogsPgRepository.setBanStatusByUserId(
        command.userId,
        command.isBanned,
      ),
      this.postsPgRepository.setBanStatusByUserId(
        command.userId,
        command.isBanned,
      ),
      this.commentsPgRepository.setBanStatusByUserId(
        command.userId,
        command.isBanned,
      ),
      this.postsReactionsPgRepository.setBanStatusByUserId(
        command.userId,
        command.isBanned,
      ),
      this.commentReactionsPgRepository.setBanStatusByUserId(
        command.userId,
        command.isBanned,
      ),
    ]);

    await this.postsPgRepository.recalculatePostReactionsAfterUserBan(
      command.userId,
    );

    await this.commentsPgRepository.recalculateCommentReactionsAfterUserBan(
      command.userId,
    );
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
