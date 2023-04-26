import { CommandHandler } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
export class AdminSetOwnerToOrphanBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(AdminSetOwnerToOrphanBlogCommand)
export class AdminSetOwnerToOrphanBlogUseCase {
  constructor(
    private usersPgRepository: UsersRepository,
    private blogsPgRepository: BlogsRepository,
  ) {}
  async execute(command: AdminSetOwnerToOrphanBlogCommand) {
    console.log(command);
    const { blogId, userId } = command;
    const blog = await this.blogsPgRepository.getById(blogId);
    await this.usersPgRepository.throwIfUserIsNotExists(userId);

    if (blog.userId !== null) {
      throw new UnprocessableEntityException(
        'Blog already has an owner. Unable to assign user as new owner.',
      );
    }
    blog.userId = userId;
    await this.blogsPgRepository.save(blog);
  }
}
