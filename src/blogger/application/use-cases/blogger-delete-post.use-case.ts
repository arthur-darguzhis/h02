import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

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
    private postsPgRepository: PostsPgRepository,
    private blogsPgRepository: BlogsPgRepository,
  ) {}
  async execute(command: BloggerDeletePostCommand) {
    console.log(command);
    const blog = await this.blogsPgRepository.getById(command.blogId);
    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This blog belongs to another user.',
      );
    }

    const post = await this.postsPgRepository.getById(command.postId);
    if (post.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This post belongs to another user.',
      );
    }
    await this.postsPgRepository.delete(command.postId);
  }
}
