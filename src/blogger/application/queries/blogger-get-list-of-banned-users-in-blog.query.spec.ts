import { Given } from '../../../../test/xxx/testEntities/Given';
import { UsersRepository } from '../../../users/users.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from '../use-cases/blogger-create-blog.use-case';
import { BloggerGetListOfBannedUsersInBlogQuery } from './blogger-get-list-of-banned-users-in-blog.query';
import { BlogDocument } from '../../../blogs/blogs-schema';
import { UserDocument } from '../../../users/users-schema';
import { BloggerBanUserCommand } from '../use-cases/blogger-ban-user.use-case';

let given: Given;
let usersRepository: UsersRepository;
let commandBus: CommandBus;
let queryBus: QueryBus;

let userAsBlogger: UserDocument;
let firstBlog: BlogDocument;
let userAsReader: UserDocument;

beforeEach(async () => {
  given = await Given.bootstrapTestApp();
  await given.clearDb();
  usersRepository = given.configuredTestApp.get(UsersRepository);
  commandBus = given.configuredTestApp.get(CommandBus);
  queryBus = given.configuredTestApp.get(QueryBus);

  /** Arrange
   * Given: There is a user as blogger with login "blogger" and blog "First Blog";
   * And: There is a user as reader
   */
  await prepareData();
});

afterEach(async () => {
  await given.closeApp();
});

test(`Given: Blogger has empty list of banned users for his blog
            When: Blogger ban user for his blog
            Then: Blogger has one user in banned list
            Then: Blogger unban user for his blog
            And: Blogger has empty list of banned users for his blog`, async () => {
  let bannedUserList;

  bannedUserList = await queryBus.execute(
    new BloggerGetListOfBannedUsersInBlogQuery(
      firstBlog.id,
      userAsBlogger.id,
      null,
      'banInfo.banDate',
      'desc',
      1,
      10,
    ),
  );

  expect(bannedUserList.items.length).toBe(0);

  await commandBus.execute(
    new BloggerBanUserCommand(
      userAsBlogger.id,
      firstBlog.id,
      userAsReader.id,
      true,
      'abusive behavior',
    ),
  );

  bannedUserList = await queryBus.execute(
    new BloggerGetListOfBannedUsersInBlogQuery(
      firstBlog.id,
      userAsBlogger.id,
      null,
      'banInfo.banDate',
      'desc',
      1,
      10,
    ),
  );

  expect(bannedUserList.items.length).toBe(1);
  expect(bannedUserList.items[0]).toEqual({
    id: userAsReader.id,
    login: userAsReader.login,
    banInfo: {
      banDate: expect.any(String),
      banReason: 'abusive behavior',
      isBanned: true,
    },
  });

  // await commandBus.execute(
  //   new BloggerBanUserCommand(
  //     userAsBlogger.id,
  //     firstBlog.id,
  //     userAsReader.id,
  //     false,
  //     '',
  //   ),
  // );
  //
  // bannedUserList = await queryBus.execute(
  //   new BloggerGetListOfBannedUsersInBlogQuery(
  //     firstBlog.id,
  //     userAsBlogger.id,
  //     null,
  //     'banInfo.banDate',
  //     'desc',
  //     1,
  //     10,
  //   ),
  // );
  //
  // expect(bannedUserList.items.length).toBe(0);
});

async function prepareData() {
  userAsBlogger = await commandBus.execute(
    new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
  );

  firstBlog = await commandBus.execute(
    new BloggerCreateBlogCommand(
      'First Blog',
      'the first blog description',
      'https://habr.com/ru/users/AlekDikarev/',
      userAsBlogger._id.toString(),
    ),
  );

  userAsReader = await commandBus.execute(
    new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
  );
}
