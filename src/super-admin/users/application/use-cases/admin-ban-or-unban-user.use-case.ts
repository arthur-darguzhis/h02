import { CommandHandler } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersPgRepository } from '../../../../users/infrastructure/users.pg-repository';
import { UserSessionsPgRepository } from '../../../../security/infrastructure/user-sessions-pg.repository';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { PostsPgRepository } from '../../../../posts/infrastructure/posts-pg.repository';
import { CommentsPgRepository } from '../../../../comments/infrastructure/comments-pg.repository';
import { PostsReactionsPgRepository } from '../../../../posts/infrastructure/posts-reactions-pg.repository';
import { CommentReactionsPgRepository } from '../../../../comments/infrastructure/comment-reactions-pg.repository';

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
    private userSessionsPgRepository: UserSessionsPgRepository,
    private blogsPgRepository: BlogsPgRepository,
    private postsPgRepository: PostsPgRepository,
    private commentsPgRepository: CommentsPgRepository,
    private postsReactionsPgRepository: PostsReactionsPgRepository,
    private commentReactionsPgRepository: CommentReactionsPgRepository,
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
