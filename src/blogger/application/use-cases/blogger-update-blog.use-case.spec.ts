import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { BloggerUpdateBlogCommand } from './blogger-update-blog.use-case';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

describe('blogger update blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsSecondBlogger;
  let blog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     * And: the user has a blog "firs blog"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Throw exception if blog belongs to another user.`, async () => {
    await expect(
      commandBus.execute(
        new BloggerUpdateBlogCommand(
          'updated name',
          'updated description',
          'https://habr.com/ru/users/updated/',
          blog.id,
          userAsSecondBlogger.id,
        ),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Unauthorized updating. This blog belongs to another user.',
      ),
    );
  });

  it(`Blogger update blog.`, async () => {
    await commandBus.execute(
      new BloggerUpdateBlogCommand(
        'updated name',
        'updated description',
        'https://habr.com/ru/users/updated/',
        blog.id,
        userAsBlogger.id,
      ),
    );
    blog = await blogsPgRepository.findByName('updated name');

    expect(blog).toEqual({
      id: blog.id,
      name: 'updated name',
      description: 'updated description',
      websiteUrl: 'https://habr.com/ru/users/updated/',
      isMembership: false,
      createdAt: expect.any(Date),
      userId: userAsBlogger.id,
      isBanned: false,
      banDate: null,
    });
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

    blog = await blogsPgRepository.findByName('first blog');

    await commandBus.execute(
      new AdminAddNewUserCommand('blogger2', '123456', 'blogger2@test.test'),
    );

    userAsSecondBlogger = await usersPgRepository.findByLogin('blogger2');
  }
});
