import { CommandHandler } from '@nestjs/cqrs';
import { PostsFactory } from '../../../posts/posts.factory';

export class BloggerCreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(BloggerCreatePostCommand)
export class BloggerCreatePostUseCase {
  constructor(private postsFactory: PostsFactory) {}
  async execute(command: BloggerCreatePostCommand) {
    return await this.postsFactory.bloggerCreatePost(command);
  }
}
