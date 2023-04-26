import { CommandHandler } from '@nestjs/cqrs';
import { PostsFactory } from '../../../posts/posts.factory';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

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
  constructor(
    private postsFactory: PostsFactory,
    private postsPgRepository: PostsRepository,
  ) {}
  async execute(command: BloggerCreatePostCommand) {
    console.log(command);
    const post = await this.postsFactory.bloggerCreatePostPg(command);
    return await this.postsPgRepository.saveNewPost(post);
  }
}
