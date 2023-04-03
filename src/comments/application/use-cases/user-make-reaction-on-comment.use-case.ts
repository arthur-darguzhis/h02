import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentReactionsPgRepository } from '../../infrastructure/comment-reactions-pg.repository';
import { CommentsPgRepository } from '../../infrastructure/comments-pg.repository';
import { CommentReactionsFactory } from '../../comment-reactions.factory';

export class UserMakeReactionOnCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly currentUserId: string,
    public readonly likeStatus: string,
  ) {}
}

@CommandHandler(UserMakeReactionOnCommentCommand)
export class UserMakeReactionOnCommentUseCase implements ICommandHandler {
  constructor(
    private commentReactionsPgRepository: CommentReactionsPgRepository,
    private commentsPgRepository: CommentsPgRepository,
    private commentReactionsFactory: CommentReactionsFactory,
  ) {}
  async execute(command: UserMakeReactionOnCommentCommand) {
    console.log(command);
    await this.commentsPgRepository.throwIfNotExists(command.commentId);
    const userReaction = await this.commentReactionsPgRepository.find(
      command.commentId,
      command.currentUserId,
    );

    if (!userReaction) {
      const commentReaction =
        await this.commentReactionsFactory.createNewCommentReaction(
          command.commentId,
          command.currentUserId,
          command.likeStatus,
        );
      await this.commentReactionsPgRepository.addCommentReaction(
        commentReaction,
      );
    } else {
      if (userReaction.status === command.likeStatus) {
        return true;
      }
      userReaction.status = command.likeStatus;
      await this.commentReactionsPgRepository.updateStatus(
        userReaction.id,
        command.likeStatus,
      );
    }

    await this.updateCommentReactionsCount(command.commentId);
  }

  public async updateCommentReactionsCount(commentId: string) {
    const likesCount =
      await this.commentReactionsPgRepository.calculateCountOfLikes(commentId);
    const dislikesCount =
      await this.commentReactionsPgRepository.calculateCountOfDislikes(
        commentId,
      );
    await this.commentsPgRepository.updateLikesInfo(
      commentId,
      likesCount,
      dislikesCount,
    );
  }
}
