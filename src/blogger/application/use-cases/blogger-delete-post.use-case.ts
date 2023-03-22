import { CommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/posts.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class BloggerDeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerDeletePostCommand)
export class BloggerDeletePostUseCase {
  constructor(
    private postsRepository: PostsRepository, //TODO inject here necessary services
  ) {}
  async execute(command: BloggerDeletePostCommand) {
    const post = await this.postsRepository.getById(command.postId);
    if (post.postOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This post belongs to another user.',
      );
    }
    await this.postsRepository.deleteById(command.postId);
  }
}
