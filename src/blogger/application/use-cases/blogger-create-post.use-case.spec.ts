import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/use-cases/admin-add-new-user.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { BloggerCreateBlogCommand } from './blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { BloggerCreatePostCommand } from './blogger-create-post.use-case';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

describe('Blogger create new post', () => {
  let given: Given;
  let usersPgRepository: UsersPgRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsAnotherBlogger;
  let firstBlog;
  let blogOfAnotherBlogger;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     * And: The user has a blog with name "first blog"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`The user is not allowed to add a new post to a blog that belongs to another user`, async () => {
    await expect(
      commandBus.execute(
        new BloggerCreatePostCommand(
          'first post',
          'short description for the first post',
          'some context for the first post',
          firstBlog.id,
          blogOfAnotherBlogger.id,
        ),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Unauthorized creating post. This blog belongs to another user.',
      ),
    );

    const post = await postsPgRepository.findByTitleAndBlog(
      'first post',
      blogOfAnotherBlogger.id,
    );
    expect(post).toBeNull();
  });

  it(`User creates new post.`, async () => {
    await commandBus.execute(
      new BloggerCreatePostCommand(
        'first post',
        'short description for the first post',
        'some context for the first post',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    const post = await postsPgRepository.findByTitleAndBlog(
      'first post',
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
      new AdminAddNewUserCommand('blogger2', '123456', 'blogger2@test.test'),
    );

    userAsAnotherBlogger = await usersPgRepository.findByLogin('blogger2');

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'another blog',
        'the first blog description',
        'https://habr.com/ru/users/AlekDrev/',
        userAsBlogger.id,
      ),
    );

    blogOfAnotherBlogger = await blogsPgRepository.findByName('another blog');
  }
});
