import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from '../use-cases/blogger-create-blog.use-case';
import { BloggerGetListOfBannedUsersInBlogQuery } from './blogger-get-list-of-banned-users-in-blog.query';
import { BloggerBanUserCommand } from '../use-cases/blogger-ban-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';

describe('Should return list of banned users in a blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let firstBlog;
  let userAsReader1;
  let userAsReader2;
  let userAsReader3;
  let userAsReader4;
  let userAsReader5;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger" and blog "First Blog";
     * And: There are 5 banned users.
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get list of banned users in a blog`, async () => {
    const data = await queryBus.execute(
      new BloggerGetListOfBannedUsersInBlogQuery(
        firstBlog.id,
        userAsBlogger.id,
        null,
        'banDate',
        'desc',
        1,
        10,
      ),
    );

    expect(data.items.length).toBe(5);
  });

  it('Get list of blogs by owner where name contain "th re"', async () => {
    const data = await queryBus.execute(
      new BloggerGetListOfBannedUsersInBlogQuery(
        firstBlog.id,
        userAsBlogger.id,
        'th re',
        'banDate',
        'desc',
        1,
        10,
      ),
    );

    expect(data.items.length).toBe(2);
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new BloggerGetListOfBannedUsersInBlogQuery(
        firstBlog.id,
        userAsBlogger.id,
        null,
        'banDate',
        'asc',
        1,
        10,
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].login).toBe('first reader');
    expect(data.items[4].login).toBe('fifth reader');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new BloggerGetListOfBannedUsersInBlogQuery(
        firstBlog.id,
        userAsBlogger.id,
        null,
        'banDate',
        'asc',
        3,
        2,
      ),
    );

    expect(data.page).toBe(3);
    expect(data.items.length).toBe(1);
    expect(data.items[0].login).toBe('fifth reader');
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

    await commandBus.execute(
      new AdminAddNewUserCommand('first reader', '123456', 'reader1@test.test'),
    );

    userAsReader1 = await usersPgRepository.findByLogin('first reader');

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'second reader',
        '123456',
        'reader2@test.test',
      ),
    );

    userAsReader2 = await usersPgRepository.findByLogin('second reader');

    await commandBus.execute(
      new AdminAddNewUserCommand('third reader', '123456', 'reader3@test.test'),
    );

    userAsReader3 = await usersPgRepository.findByLogin('third reader');

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'fourth reader',
        '123456',
        'reader4@test.test',
      ),
    );

    userAsReader4 = await usersPgRepository.findByLogin('fourth reader');

    await commandBus.execute(
      new AdminAddNewUserCommand('fifth reader', '123456', 'reader5@test.test'),
    );

    userAsReader5 = await usersPgRepository.findByLogin('fifth reader');

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader1.id,
        true,
        'abuse behaviour',
      ),
    );

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader2.id,
        true,
        'abuse behaviour',
      ),
    );

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader3.id,
        true,
        'abuse behaviour',
      ),
    );

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader4.id,
        true,
        'abuse behaviour',
      ),
    );

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader5.id,
        true,
        'abuse behaviour',
      ),
    );
  }
});
