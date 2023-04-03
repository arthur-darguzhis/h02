import { CommandHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

export class BloggerUpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}

@CommandHandler(BloggerUpdatePostCommand)
export class BloggerUpdatePostUseCase {
  constructor(
    private postsPgRepository: PostsPgRepository,
    private blogsPgRepository: BlogsPgRepository,
  ) {}
  async execute(command: BloggerUpdatePostCommand) {
    console.log(command);
    const blog = await this.blogsPgRepository.getById(command.blogId);
    if (blog.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized update. This blog belongs to another user.',
      );
    }

    const post = await this.postsPgRepository.getById(command.postId);
    if (post.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized update. This post belongs to another user.',
      );
    }

    post.title = command.title;
    post.shortDescription = command.shortDescription;
    post.content = command.content;
    await this.postsPgRepository.update(post);
  }
}
