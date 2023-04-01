import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../users/use-cases/admin-add-new-user.use-case';
import { AdminBanOrUnbanBlogCommand } from './admin-ban-or-unban-blog.use-case';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post';
import { GetPaginatedPostsListByBlogIdQuery } from '../../../posts/application/query/get-paginated-posts-list-by-blog-id.query';

describe('POST blogger ban user (e2e)', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let userAsReader;
  let firstBlog;
  let postInFirstBlog;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger"
     * And: The blogger has a blog with name "First Blog" with post "test posts"
     * And: There is a user as reader with login "reader"
     */
    await prepareData();
  });

  test(`Given: user as reader see post of not banned blog
  When: Admin ban the blog
  Then: user as reader can't see the post of banned blog`, async () => {
    let response = await queryBus.execute(
      new GetPaginatedPostsListByBlogIdQuery(
        firstBlog.id,
        'createdAt',
        'desc',
        10,
        1,
        userAsReader.id,
      ),
    );

    expect(response.items.length).toBe(1);

    await commandBus.execute(
      new AdminBanOrUnbanBlogCommand(firstBlog.id, true),
    );

    response = await queryBus.execute(
      new GetPaginatedPostsListByBlogIdQuery(
        firstBlog.id,
        'createdAt',
        'desc',
        10,
        1,
        userAsReader.id,
      ),
    );

    expect(response.items.length).toBe(0);

    await commandBus.execute(
      new AdminBanOrUnbanBlogCommand(firstBlog.id, false),
    );

    response = await queryBus.execute(
      new GetPaginatedPostsListByBlogIdQuery(
        firstBlog.id,
        'createdAt',
        'desc',
        10,
        1,
        userAsReader.id,
      ),
    );

    expect(response.items.length).toBe(1);
  });

  afterEach(async () => {
    await given.closeApp();
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

    userAsReader = await commandBus.execute(
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );
  }
});
