import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

describe('blogger create new blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let commandBus: CommandBus;

  let userAsBlogger;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`User creates new blog.`, async () => {
    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'first blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    const blog = await blogsPgRepository.findByName('first blog');
    expect(blog).not.toBeNull();
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
  }
});
