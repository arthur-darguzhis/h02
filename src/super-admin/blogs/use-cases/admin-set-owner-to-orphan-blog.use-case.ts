import { CommandHandler } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
export class AdminSetOwnerToOrphanBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(AdminSetOwnerToOrphanBlogCommand)
export class AdminSetOwnerToOrphanBlogUseCase {
  constructor(
    private usersPgRepository: UsersPgRepository,
    private blogsPgRepository: BlogsPgRepository,
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

    await this.blogsPgRepository.updateOwner(userId, blog.id);
  }
}
