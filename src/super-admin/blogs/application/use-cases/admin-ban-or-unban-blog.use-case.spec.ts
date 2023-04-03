import { Given } from '../../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../users/application/use-cases/admin-add-new-user.use-case';
import { AdminBanOrUnbanBlogCommand } from './admin-ban-or-unban-blog.use-case';
import { BloggerCreateBlogCommand } from '../../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from '../../../../blogger/application/use-cases/blogger-create-post.use-case';
import { UsersPgRepository } from '../../../../users/infrastructure/users.pg-repository';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { PostsPgRepository } from '../../../../posts/infrastructure/posts-pg.repository';

describe(`Admin ban or unban blog with it's posts`, () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;

  let userAsBlogger;
  let userAsReader;
  let firstBlog;
  let postInFirstBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     * And: The blogger has a blog with name "First Blog" with post "test posts"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  test(`Admin ban blog with posts`, async () => {
    await commandBus.execute(
      new AdminBanOrUnbanBlogCommand(firstBlog.id, true),
    );

    const blog = await blogsPgRepository.findById(firstBlog.id);
    expect(blog.isBanned).toBe(true);
    expect(blog.banDate).not.toBeNull();

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.isBanned).toBe(true);
  });

  test(`GIVEN: banned blog.
              WHEN: Admin unban blog with posts
              THEN: blog and posts have "isBanned = false"`, async () => {
    //Arrange
    await commandBus.execute(
      new AdminBanOrUnbanBlogCommand(firstBlog.id, true),
    );

    //Act
    await commandBus.execute(
      new AdminBanOrUnbanBlogCommand(firstBlog.id, false),
    );

    //Assert
    const blog = await blogsPgRepository.findById(firstBlog.id);
    expect(blog.isBanned).toBe(false);
    expect(blog.banDate).toBeNull();

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.isBanned).toBe(false);
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
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );

    userAsReader = await usersPgRepository.findByLogin('reader');
  }
});
