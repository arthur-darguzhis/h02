import { CommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/posts.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UpdatePostWithoutBlogIdDto } from '../../../posts/dto/updatePostWithoutBlogId.dto';

export class BloggerUpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public dto: UpdatePostWithoutBlogIdDto,
  ) {}
}

@CommandHandler(BloggerUpdatePostCommand)
export class BloggerUpdatePostUseCase {
  constructor(
    private postsRepository: PostsRepository, //TODO inject here necessary services
  ) {}
  async execute(command: BloggerUpdatePostCommand) {
    const post = await this.postsRepository.getById(command.postId);

    if (post.postOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized update. This post belongs to another user.',
      );
    }

    post.title = command.dto.title;
    post.shortDescription = command.dto.shortDescription;
    post.content = command.dto.content;
    await this.postsRepository.save(post);
  }
}
