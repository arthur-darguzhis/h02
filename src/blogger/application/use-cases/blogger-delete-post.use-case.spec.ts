import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { BloggerDeleteBlogCommand } from './blogger-delete-blog.use-case';
import { BloggerDeletePostCommand } from './blogger-delete-post.use-case';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { BloggerCreatePostCommand } from './blogger-create-post.use-case';

describe('Blogger delete blog', () => {
  let given: Given;
  let usersPgRepository: UsersPgRepository;
  let blogsPgRepository: BlogsPgRepository;
  let commandBus: CommandBus;
  let postsPgRepository: PostsPgRepository;

  let userAsBlogger;
  let userAsSecondBlogger;
  let postInFirstBlog;
  let firstBlog;
  let blogOfTheSecondBlogger;
  let postInSecondBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);

    /** Arrange
     * Given: There are 2 bloggers with "blogger" and "blogger2" logins
     * And: "blogger" has blog "first blog" with a post "first post"
     * And: "blogger2" has blog "second blog" with a post "first post"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`The user is not allowed to delete a post that belongs to another user`, async () => {
    await expect(
      commandBus.execute(
        new BloggerDeleteBlogCommand(firstBlog.id, userAsSecondBlogger.id),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Unauthorized delete. This blog belongs to another user.',
      ),
    );
  });

  it(`Blogger delete blog`, async () => {
    await commandBus.execute(
      new BloggerDeletePostCommand(
        firstBlog.id,
        postInFirstBlog.id,
        userAsBlogger.id,
      ),
    );

    firstBlog = await postsPgRepository.findByTitleAndBlog(
      'first post',
      firstBlog.id,
    );
    expect(firstBlog).toBeNull();
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
        'first post',
        'short description of first post',
        'content of the comment',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    postInFirstBlog = await postsPgRepository.findByTitleAndBlog(
      'first post',
      firstBlog.id,
    );

    //Second blogger with post
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger2', '123456', 'blogger2@test.test'),
    );

    userAsSecondBlogger = await usersPgRepository.findByLogin('blogger2');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'second blog',
        'the second blog description',
        'https://habr.com/ru/users/Alarev/',
        userAsSecondBlogger.id,
      ),
    );

    blogOfTheSecondBlogger = await blogsPgRepository.findByName('second blog');

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'second post',
        'short description of first post',
        'content of the comment',
        blogOfTheSecondBlogger.id,
        userAsSecondBlogger.id,
      ),
    );

    postInSecondBlog = await postsPgRepository.findByTitleAndBlog(
      'second post',
      blogOfTheSecondBlogger.id,
    );
  }
});
