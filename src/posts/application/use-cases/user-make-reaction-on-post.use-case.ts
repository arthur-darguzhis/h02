import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsReactionsRepository } from '../../infrastructure/posts-reactions.repository';
import { PostReactionsFactory } from '../../post-reaction.factory';
import { Post } from '../entities/post';

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
    private postsRepository: PostsRepository,
    private postsReactionsPgRepository: PostsReactionsRepository,
    private postReactionsFactory: PostReactionsFactory,
  ) {}
  async execute(command: UserMakeReactionOnPostCommand) {
    console.log(command);
    const post = await this.postsRepository.getById(command.postId);
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
      await this.postsReactionsPgRepository.save(userReaction);
    } else {
      if (userReaction.status === command.likeStatus) {
        return true;
      }
      userReaction.status = command.likeStatus;
      await this.postsReactionsPgRepository.save(userReaction);
    }

    await this.updatePostReactionsCount(post);
  }

  public async updatePostReactionsCount(post: Post) {
    const likesCount =
      await this.postsReactionsPgRepository.calculateCountOfLikes(post.id);
    const dislikesCount =
      await this.postsReactionsPgRepository.calculateCountOfDislikes(post.id);
    const newestLikes =
      await this.postsReactionsPgRepository.getNewestLikesOnThePost(post.id);

    post.likesCount = likesCount;
    post.dislikesCount = dislikesCount;
    post.newestLikes = newestLikes;
    await this.postsRepository.save(post);
  }
}
