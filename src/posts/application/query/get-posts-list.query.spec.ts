import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { UserMakeReactionOnPostCommand } from '../use-cases/user-make-reaction-on-post.use-case';
import { GetPostsListQuery } from './get-posts-list.query';
import { AdminBanOrUnbanBlogCommand } from '../../../super-admin/blogs/application/use-cases/admin-ban-or-unban-blog.use-case';

describe('Return posts list', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let postsPgRepository: PostsRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let userAsReader1;
  let userAsReader2;

  let blog1;
  let post1blog1;
  let post2blog1;
  let blog2;
  let post1blog2;
  let post2blog2;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);
    postsPgRepository = given.configuredTestApp.get(PostsRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger";
     * And: Blogger has 2 blogs "First blog" and "Second blog" with 2 posts in each blog
     * And: There are 2 users and each user has reactions on each post ('Like')
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get posts list in a blog as a guest "extendedLikesInfo.myStatus" should be "None"`, async () => {
    const data = await queryBus.execute(
      new GetPostsListQuery('createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(4);
    expect(data.items[0].extendedLikesInfo.myStatus).toBe('None');
    expect(data.items[1].extendedLikesInfo.myStatus).toBe('None');
  });

  it(`Check that banned posts are not in the list`, async () => {
    await commandBus.execute(new AdminBanOrUnbanBlogCommand(blog1.id, true));

    const data = await queryBus.execute(
      new GetPostsListQuery('createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(2);
    expect(data.items[0].extendedLikesInfo.myStatus).toBe('None');
    expect(data.items[1].extendedLikesInfo.myStatus).toBe('None');
  });

  it(`Get posts list in a blog as a "userAsReader1" "extendedLikesInfo.myStatus" should be "None"`, async () => {
    const data = await queryBus.execute(
      new GetPostsListQuery('createdAt', 'desc', 10, 1, userAsReader1.id),
    );

    expect(data.items.length).toBe(4);
    expect(data.items[0].extendedLikesInfo.myStatus).toBe('None');
    expect(data.items[1].extendedLikesInfo.myStatus).toBe('Like');
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetPostsListQuery('createdAt', 'asc', 10, 1),
    );

    expect(data.items.length).toBe(4);
    expect(data.items[0].title).toBe('test post1 title');
    expect(data.items[1].title).toBe('test post2 title');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetPostsListQuery('createdAt', 'asc', 1, 2),
    );

    expect(data.page).toBe(2);
    expect(data.items.length).toBe(1);
    expect(data.items[0].title).toBe('test post2 title');
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader1', '123456', 'reader1@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader2', '123456', 'reader2@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
    userAsReader1 = await usersPgRepository.findByLogin('reader1');
    userAsReader2 = await usersPgRepository.findByLogin('reader2');

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
      new BloggerCreatePostCommand(
        'test post1 title',
        'test post short description',
        'test post content',
        blog1.id,
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post2 title',
        'test post short description',
        'test post content',
        blog1.id,
        userAsBlogger.id,
      ),
    );

    post1blog1 = await postsPgRepository.findByTitleAndBlog(
      'test post1 title',
      blog1.id,
    );

    post2blog1 = await postsPgRepository.findByTitleAndBlog(
      'test post2 title',
      blog1.id,
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        post1blog1.id,
        userAsReader1.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        post1blog1.id,
        userAsReader2.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new BloggerCreateBlogCommand(
        'Second Blog',
        'the second blog description',
        'https://habr.com/ru/users/AlDikarev/',
        userAsBlogger.id,
      ),
    );

    blog2 = await blogsPgRepository.findByName('Second Blog');

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post1 title',
        'test post short description',
        'test post content',
        blog2.id,
        userAsBlogger.id,
      ),
    );

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'test post2 title',
        'test post short description',
        'test post content',
        blog2.id,
        userAsBlogger.id,
      ),
    );

    post1blog2 = await postsPgRepository.findByTitleAndBlog(
      'test post1 title',
      blog2.id,
    );

    post2blog2 = await postsPgRepository.findByTitleAndBlog(
      'test post2 title',
      blog2.id,
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        post1blog2.id,
        userAsReader1.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        post1blog2.id,
        userAsReader2.id,
        'Like',
      ),
    );
  }
});
