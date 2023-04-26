import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { BloggerCreatePostCommand } from './blogger-create-post.use-case';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerUpdatePostCommand } from './blogger-update-post.use-case';

describe('Blogger update a post', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsSecondBlogger;
  let firstBlog;
  let secondBlog;
  let postInFirstBlog;
  let postInSecondBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There are 2 blogger with login "blogger" and "blogger2" logins
     * And: They have blogs "first blog" and "second blog"
     * And: Each blog has a post "first blog post"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`The user is not allowed to update a post that belongs to another user`, async () => {
    await expect(
      commandBus.execute(
        new BloggerUpdatePostCommand(
          firstBlog.id,
          postInSecondBlog.id,
          userAsBlogger.id,
          'updated title',
          'updated short description',
          'updated content',
        ),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Unauthorized update. This post belongs to another user.',
      ),
    );
  });

  it(`Blogger update post.`, async () => {
    await commandBus.execute(
      new BloggerUpdatePostCommand(
        firstBlog.id,
        postInFirstBlog.id,
        userAsBlogger.id,
        'updated title',
        'updated short description',
        'updated content',
      ),
    );

    const post = await postsPgRepository.findByTitleAndBlog(
      'updated title',
      firstBlog.id,
    );
    expect(post).not.toBeNull();
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

    firstBlog = await blogsPgRepository.findByName('first blog');

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

    //

    await commandBus.execute(
      new AdminAddNewUserCommand('blogger2', '123456', 'blogger2@test.test'),
    );

    userAsSecondBlogger = await usersPgRepository.findByLogin('blogger2');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'second blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDrev/',
        userAsSecondBlogger.id,
      ),
    );

    secondBlog = await blogsPgRepository.findByName('second blog');

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post title',
        'test post short description',
        'test post content',
        secondBlog.id,
        userAsSecondBlogger.id,
      ),
    );

    postInSecondBlog = await postsPgRepository.findByTitleAndBlog(
      'test post title',
      secondBlog.id,
    );
  }
});
