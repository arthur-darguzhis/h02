import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerDeleteBlogCommand } from './blogger-delete-blog.use-case';

describe('Blogger delete blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsSecondBlogger;
  let firstBlog;
  let blogOfTheSecondBlogger;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There are 2 bloggers with "blogger" and "blogger2" logins
     * And: "blogger" has blog "first blog"
     * And: "blogger2" has blog "second blog"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`The user is not allowed to delete a blog that belongs to another user`, async () => {
    await expect(
      commandBus.execute(
        new BloggerDeleteBlogCommand(firstBlog.id, userAsSecondBlogger.id),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Unauthorized delete. This blog belongs to another user.',
      ),
    );
  });

  it(`Blogger delete blog`, async () => {
    await commandBus.execute(
      new BloggerDeleteBlogCommand(firstBlog.id, userAsBlogger.id),
    );

    firstBlog = await blogsPgRepository.findByName('first blog');
    expect(firstBlog).toBeNull();
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'first blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    firstBlog = await blogsPgRepository.findByName('first blog');

    await commandBus.execute(
      new AdminAddNewUserCommand('blogger2', '123456', 'blogger2@test.test'),
    );

    userAsSecondBlogger = await usersPgRepository.findByLogin('blogger2');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'second blog',
        'the second blog description',
        'https://habr.com/ru/users/Alekarev/',
        userAsBlogger.id,
      ),
    );

    blogOfTheSecondBlogger = await blogsPgRepository.findByName('second blog');
  }
});
