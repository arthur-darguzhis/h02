import { Given } from '../../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { AdminCreateBlogCommand } from './admin-create-blog.use-case';

describe('Admin create blog', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;

  let userAsBlogger;
  let firstBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);

    /** Arrange
     * Given: There is blogger with "blogger" login and without any blog
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Admin create blog without owner`, async () => {
    await commandBus.execute(
      new AdminCreateBlogCommand(
        'first blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
      ),
    );

    firstBlog = await blogsPgRepository.findByName('first blog');

    expect(firstBlog.userId).toBeNull();
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
  }
});
