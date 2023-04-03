import { CommandHandler } from '@nestjs/cqrs';
import { CommentsFactory } from '../../../comments/comments.factory';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { PostsPgRepository } from '../../infrastructure/posts-pg.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { CommentsPgRepository } from '../../../comments/infrastructure/comments-pg.repository';
import { BlogUserBanRepository } from '../../../blogs/infrastructure/blog-user-ban.repository';

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
    private postsPgRepository: PostsPgRepository,
    private blogsPgRepository: BlogsPgRepository,
    private commentsPgRepository: CommentsPgRepository,
    private commentsFactory: CommentsFactory,
    private blogUserBanRepository: BlogUserBanRepository,
  ) {}
  async execute(command: UserAddCommentCommand) {
    console.log(command);
    const post = await this.postsPgRepository.getById(command.postId);
    const blog = await this.blogsPgRepository.getById(post.blogId);

    if (await this.isUserBannedForBlog(blog.id, command.currentUserId)) {
      throw new UnauthorizedActionException(
        'This user is banned for this blog',
      );
    }

    const comment = this.commentsFactory.createNewCommentPg(
      command.postId,
      command.currentUserId,
      command.content,
    );

    return await this.commentsPgRepository.saveNewComment(comment);
  }

  private async isUserBannedForBlog(blogId: string, userId: string) {
    return this.blogUserBanRepository.findOne(blogId, userId);
  }
}
