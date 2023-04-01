import { CommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { CommentsFactory } from '../../../comments/comments.factory';
import { BlogUserBansRepository } from '../../../blogs/blog-user-bans.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UserAddCommentCommand {
  constructor(
    public readonly content,
    public readonly postId,
    public readonly currentUserId,
  ) {}
}

@CommandHandler(UserAddCommentCommand)
export class UserAddCommentUseCase {
  constructor(
    private postsRepository: PostsRepository,
    private commentsFactory: CommentsFactory,
    private blogsRepository: BlogsRepository,
    private blogUserBansRepository: BlogUserBansRepository,
  ) {}
  async execute(command: UserAddCommentCommand) {
    const post = await this.postsRepository.getById(command.postId);
    const blog = await this.blogsRepository.getById(post.blogId);

    if (await this.isUserBannedForBlog(blog.id, command.currentUserId)) {
      throw new UnauthorizedActionException(
        'This user is banned for this blog',
      );
    }

    return await this.commentsFactory.createNewComment(
      command.postId,
      post.postOwnerInfo.userId,
      command.currentUserId,
      command.content,
    );
  }

  private async isUserBannedForBlog(blogId: string, userId: string) {
    return this.blogUserBansRepository.findOne(blogId, userId);
  }
}
