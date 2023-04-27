import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentReactionsRepository } from '../../infrastructure/comment-reactions.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentReactionsFactory } from '../../comment-reactions.factory';
import { Comment } from '../entities/comment';

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
    private commentReactionsPgRepository: CommentReactionsRepository,
    private commentsRepository: CommentsRepository,
    private commentReactionsFactory: CommentReactionsFactory,
  ) {}
  async execute(command: UserMakeReactionOnCommentCommand) {
    console.log(command);
    const comment = await this.commentsRepository.getById(command.commentId);
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

    await this.updateCommentReactionsCount(command);
  }

  public async updateCommentReactionsCount(comment: Comment) {
    const likesCount =
      await this.commentReactionsPgRepository.calculateCountOfLikes(comment.id);
    const dislikesCount =
      await this.commentReactionsPgRepository.calculateCountOfDislikes(
        comment.id,
      );
    comment.likesCount = likesCount;
    comment.dislikesCount = dislikesCount;
    await this.commentsRepository.save(comment);
  }
}
