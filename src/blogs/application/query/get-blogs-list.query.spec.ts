import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { GetBlogsListQuery } from './get-blogs-list.query';
import { AdminBanOrUnbanBlogCommand } from '../../../super-admin/blogs/application/use-cases/admin-ban-or-unban-blog.use-case';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

describe('Should return list of banned users in a blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let blogsPgRepository: BlogsRepository;

  let userAsBlogger;
  let blog1;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger" and 5 blogs;
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get list of blogs`, async () => {
    const data = await queryBus.execute(
      new GetBlogsListQuery(null, 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(5);
  });

  it(`Check that banned blog is not in the list`, async () => {
    await commandBus.execute(new AdminBanOrUnbanBlogCommand(blog1.id, true));

    const data = await queryBus.execute(
      new GetBlogsListQuery(null, 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(4);
  });

  it(`Check search by blog name`, async () => {
    const data = await queryBus.execute(
      new GetBlogsListQuery('th bl', 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(2);
    expect(data.items[0].name).toBe('Fifth Blog');
    expect(data.items[1].name).toBe('Fourth Blog');
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetBlogsListQuery(null, 'createdAt', 'asc', 10, 1),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].description).toBe('the first blog description');
    expect(data.items[4].description).toBe('the fifth blog description');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetBlogsListQuery(null, 'createdAt', 'asc', 2, 3),
    );

    expect(data.page).toBe(3);
    expect(data.items.length).toBe(1);
    expect(data.items[0].name).toBe('Fifth Blog');
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

    blog1 = await blogsPgRepository.findByName('First Blog');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Second Blog',
        'the second blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Third Blog',
        'the third blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Fourth Blog',
        'the third blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Fifth Blog',
        'the fifth blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );
  }
});
