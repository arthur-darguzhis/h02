import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/users.repository';
import { BlogsRepository } from '../../../../blogs/blogs.repository';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { BlogOwnerInfo } from '../../../../blogs/blogs-schema';
export class AdminSetOwnerToOrphanBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(AdminSetOwnerToOrphanBlogCommand)
export class AdminSetOwnerToOrphanBlogUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: AdminSetOwnerToOrphanBlogCommand) {
    const { blogId, userId } = command;
    const blog = await this.blogsRepository.getById(blogId);
    const user = await this.usersRepository.getById(userId);

    if (blog.blogOwnerInfo?.userId) {
      throw new UnprocessableEntityException(
        'Blog already has an owner. Unable to assign user as new owner.',
      );
    }
    const blogOwnerInfo: BlogOwnerInfo = {
      userId: userId,
      userLogin: user.login,
    };
    blog.blogOwnerInfo = blogOwnerInfo;

    await this.blogsRepository.save(blog);
  }
}
