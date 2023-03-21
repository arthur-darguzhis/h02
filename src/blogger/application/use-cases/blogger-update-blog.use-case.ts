import { CommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../../blogs/dto/updateBlog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class BloggerUpdateBlogCommand {
  constructor(
    public dto: UpdateBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUpdateBlogCommand)
export class BloggerUpdateBlogUseCase {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BloggerUpdateBlogCommand) {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (blog.blogOwnerInfo.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized updating. This blog belongs to another user.',
      );
    }
    blog.name = command.dto.name;
    blog.description = command.dto.description;
    blog.websiteUrl = command.dto.websiteUrl;
    await this.blogsRepository.save(blog);
  }
}
