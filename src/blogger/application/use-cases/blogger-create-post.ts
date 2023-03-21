import { CommandHandler } from '@nestjs/cqrs';
import { PostsFactory } from '../../../posts/posts.factory';
import { CreatePostWithoutBlogIdDto } from '../../../posts/dto/createPostWithoutBlogId.dto';

export class BloggerCreatePostCommand {
  constructor(
    public dto: CreatePostWithoutBlogIdDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerCreatePostCommand)
export class BloggerCreatePostUseCase {
  constructor(private postsFactory: PostsFactory) {}
  async execute(command: BloggerCreatePostCommand) {
    return await this.postsFactory.bloggerCreateNewPost(
      command.blogId,
      command.dto,
      command.userId,
    );
  }
}
