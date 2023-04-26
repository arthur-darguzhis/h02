import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from './blogger-create-post.use-case';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';
import { BloggerBanUserCommand } from './blogger-ban-user.use-case';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

describe('Blogger ban user', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsSecondBlogger;
  let firstBlog;
  let postInFirstBlog;
  let secondBlog;
  let postInSecondBlog;
  let userAsReader;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
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

  it(`Throw error if userId is an id of not exists user`, async () => {
    await expect(
      commandBus.execute(
        new BloggerBanUserCommand(
          userAsBlogger.id,
          firstBlog.id,
          UUID_THAT_IS_NOT_EXISTS,
          true,
          'abusive behavior',
        ),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `User with id: ${UUID_THAT_IS_NOT_EXISTS} is not exists`,
        'login',
      ),
    );
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
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'secondBlogger',
        '123456',
        'secondBlogger@test.test',
      ),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
    userAsSecondBlogger = await usersPgRepository.findByLogin('secondBlogger');

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
      new BloggerCreatePostCommand(
        'test post title',
        'test post short description',
        'test post content',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    postInFirstBlog = await postsPgRepository.findByTitleAndBlog(
      'test post title',
      firstBlog.id,
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Second Blog',
        'the second blog description',
        'https://habr.com/ru/users/AlekDikarev/',
        userAsBlogger.id,
      ),
    );

    secondBlog = await blogsPgRepository.findByName('Second Blog');

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post title',
        'test post short description',
        'test post content',
        secondBlog.id,
        userAsBlogger.id,
      ),
    );

    postInSecondBlog = await postsPgRepository.findByTitleAndBlog(
      'test post title',
      secondBlog.id,
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );

    userAsReader = await usersPgRepository.findByLogin('reader');
  }
});
