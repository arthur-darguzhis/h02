import { CommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/posts.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BlogsRepository } from '../../../blogs/blogs.repository';

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
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: BloggerDeletePostCommand) {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (blog.blogOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This blog belongs to another user.',
      );
    }

    const post = await this.postsRepository.getById(command.postId);
    if (post.postOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This post belongs to another user.',
      );
    }
    await this.postsRepository.deleteById(command.postId);
  }
}
