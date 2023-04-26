import { Given } from '../../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { AdminCreateBlogCommand } from './admin-create-blog.use-case';
import { AdminSetOwnerToOrphanBlogCommand } from './admin-set-owner-to-orphan-blog.use-case';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

describe('Admin set owner to an orphan blog', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;

  let userAsBlogger;
  let userAsSecondBlogger;
  let firstBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);

    /** Arrange
     * Given: There are 2 users with "blogger" and "blogger1" login and without any blogs
     * And: There is a blog "first blog" without owner
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Admin create blog without owner`, async () => {
    await commandBus.execute(
      new AdminSetOwnerToOrphanBlogCommand(firstBlog.id, userAsBlogger.id),
    );

    const blog = await blogsPgRepository.findByName('first blog');
    expect(blog.userId).toBe(userAsBlogger.id);
  });

  it(`Throw error when admin try to set an owner for a blog that belongs to another blogger`, async () => {
    //Arrange
    await commandBus.execute(
      new AdminSetOwnerToOrphanBlogCommand(firstBlog.id, userAsBlogger.id),
    );

    //Act && Assert
    await expect(
      commandBus.execute(
        new AdminSetOwnerToOrphanBlogCommand(
          firstBlog.id,
          userAsSecondBlogger.id,
        ),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException(
        'Blog already has an owner. Unable to assign user as new owner.',
      ),
    );
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('blogger1', '123456', 'blogger1@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
    userAsSecondBlogger = await usersPgRepository.findByLogin('blogger1');

    await commandBus.execute(
      new AdminCreateBlogCommand(
        'first blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
      ),
    );

    firstBlog = await blogsPgRepository.findByName('first blog');
  }
});
