import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { GetBlogInfoQuery } from './get-blog-info.query';

describe('Should return list of banned users in a blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let firstBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger";
     * And: User "blogger" has a blog "First Blog"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get list of banned users in a blog`, async () => {
    const data = await queryBus.execute(new GetBlogInfoQuery(firstBlog.id));

    expect(data).toEqual({
      id: firstBlog.id,
      name: 'First Blog',
      description: 'the first blog description',
      websiteUrl: 'https://habr.com/ru/users/AlekDikarev/',
      isMembership: false,
      createdAt: expect.any(Date),
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    });
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'First Blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    firstBlog = await blogsPgRepository.findByName('First Blog');
  }
});
