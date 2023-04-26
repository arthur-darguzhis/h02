import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsReactionsRepository } from '../../infrastructure/posts-reactions.repository';
import { PostReactionsFactory } from '../../post-reaction.factory';

export class UserMakeReactionOnPostCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly likeStatus: string,
  ) {}
}

@CommandHandler(UserMakeReactionOnPostCommand)
export class UserMakeReactionOnPostUseCase implements ICommandHandler {
  constructor(
    private postsPgRepository: PostsRepository,
    private postsReactionsPgRepository: PostsReactionsRepository,
    private postReactionsFactory: PostReactionsFactory,
  ) {}
  async execute(command: UserMakeReactionOnPostCommand) {
    console.log(command);
    await this.postsPgRepository.throwIfNotExists(command.postId);
    const userReaction = await this.postsReactionsPgRepository.findUserReaction(
      command.postId,
      command.userId,
    );

    if (!userReaction) {
      const userReaction =
        await this.postReactionsFactory.createNewPostReaction(
          command.postId,
          command.userId,
          command.likeStatus,
        );
      await this.postsReactionsPgRepository.addPostReaction(userReaction);
    } else {
      if (userReaction.status === command.likeStatus) {
        return true;
      }
      userReaction.status = command.likeStatus;
      await this.postsReactionsPgRepository.updateStatus(
        userReaction.id,
        userReaction.status,
      );
    }

    await this.updatePostReactionsCount(command.postId);
  }

  public async updatePostReactionsCount(postId: string) {
    const likesCount =
      await this.postsReactionsPgRepository.calculateCountOfLikes(postId);
    const dislikesCount =
      await this.postsReactionsPgRepository.calculateCountOfDislikes(postId);
    const newestLikes =
      await this.postsReactionsPgRepository.getNewestLikesOnThePost(postId);
    await this.postsPgRepository.updateLikesInfo(
      postId,
      likesCount,
      dislikesCount,
      newestLikes,
    );
  }
}
