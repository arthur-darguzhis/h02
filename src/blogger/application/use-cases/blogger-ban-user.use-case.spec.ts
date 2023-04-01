import { Given } from '../../../../test/xxx/testEntities/Given';
import { UsersRepository } from '../../../users/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from './blogger-create-post';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';
import { BloggerBanUserCommand } from './blogger-ban-user.use-case';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

describe('POST blogger ban user (e2e)', () => {
  let given: Given;
  let usersRepository: UsersRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let firstBlog;
  let postInFirstBlog;
  let secondBlog;
  let postInSecondBlog;
  let userAsReader;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersRepository = given.configuredTestApp.get(UsersRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     * And: The blogger has two blogs with "First Blog", "Second Blog" names;
     * And: Both blogs has "test posts"
     * And: There is a user as reader
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Given: User as reader send comment to a post. 
            When: Blogger ban the user. 
            Then: User can not send comments to any post in the blog`, async () => {
    await commandBus.execute(
      new UserAddCommentCommand(
        'test content from user before being banned',
        postInFirstBlog.id,
        userAsReader.id,
      ),
    );

    await commandBus.execute(
      new BloggerBanUserCommand(
        userAsBlogger.id,
        firstBlog.id,
        userAsReader.id,
        true,
        'abusive behavior',
      ),
    );

    await expect(
      commandBus.execute(
        new UserAddCommentCommand(
          'test content from banned user',
          postInFirstBlog.id,
          userAsReader.id,
        ),
      ),
    ).rejects.toThrow(UnauthorizedActionException);
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
        userAsBlogger.id,
      ),
    );

    postInFirstBlog = await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post title',
        'test post short description',
        'test post content',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    secondBlog = await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Second Blog',
        'the second blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    postInSecondBlog = await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post title',
        'test post short description',
        'test post content',
        secondBlog.id,
        userAsBlogger.id,
      ),
    );

    userAsReader = await commandBus.execute(
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );
  }
});
