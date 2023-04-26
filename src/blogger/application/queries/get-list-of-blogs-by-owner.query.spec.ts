import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from '../use-cases/blogger-create-blog.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { GetListOfBlogsByOwnerQuery } from './get-list-of-blogs-by-owner.query';

describe('Should return blogs list by owner', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger" and blog 5 blogs "First Blog", "Second Blog"...;
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('Get list of blogs by owner', async () => {
    const data = await queryBus.execute(
      new GetListOfBlogsByOwnerQuery(userAsBlogger.id),
    );

    expect(data.items.length).toBe(5);
  });

  it('Get list of blogs by owner where name contain "th Bl"', async () => {
    const data = await queryBus.execute(
      new GetListOfBlogsByOwnerQuery(userAsBlogger.id, 'th Bl'),
    );

    expect(data.items.length).toBe(2);
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetListOfBlogsByOwnerQuery(
        userAsBlogger.id,
        'Blog',
        'createdAt',
        'asc',
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].name).toBe('First Blog');
    expect(data.items[4].name).toBe('Fifth Blog');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetListOfBlogsByOwnerQuery(
        userAsBlogger.id,
        'Blog',
        'createdAt',
        'asc',
        2,
        3,
      ),
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

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Second Blog',
        'the second blog description',
        'https://habr.com/ru/users/AlekDirev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Third Blog',
        'the third blog description',
        'https://habr.com/ru/users/Aikarev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Fourth Blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Fifth Blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );
  }
});
