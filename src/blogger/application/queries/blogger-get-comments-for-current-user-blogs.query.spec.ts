import { Given } from '../../../../test/xxx/testEntities/Given';
import { UsersRepository } from '../../../users/users.repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from '../use-cases/blogger-create-blog.use-case';
import { BlogDocument } from '../../../blogs/blogs-schema';
import { UserDocument } from '../../../users/users-schema';
import { BloggerCreatePostCommand } from '../use-cases/blogger-create-post';
import { PostDocument } from '../../../posts/posts-schema';
import { BloggerGetCommentsForCurrentUserBlogsQuery } from './blogger-get-comments-for-current-user-blogs.query';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';

let given: Given;
let usersRepository: UsersRepository;
let commandBus: CommandBus;
let queryBus: QueryBus;

let userAsBlogger: UserDocument;
let firstBlog: BlogDocument;
let postInFirstBlog: PostDocument;
let userAsReader: UserDocument;
let commensInBloggerPosts;

beforeEach(async () => {
  given = await Given.bootstrapTestApp();
  await given.clearDb();
  usersRepository = given.configuredTestApp.get(UsersRepository);
  commandBus = given.configuredTestApp.get(CommandBus);
  queryBus = given.configuredTestApp.get(QueryBus);

  /** Arrange
   * Given: There is a user as blogger with login "blogger" and blog "First Blog";
   * And : blogger has a post "test post"
   * And: There is a user as reader
   */
  await prepareData();
});

afterEach(async () => {
  await given.closeApp();
});

test(`Given: Blogger has no comment in his posts
            When: somebody left comment in a blogger post
            Then: blogger has one comment the paginated lists`, async () => {
  commensInBloggerPosts = await queryBus.execute(
    new BloggerGetCommentsForCurrentUserBlogsQuery(
      userAsBlogger.id,
      'createdAt',
      'desc',
      1,
      10,
    ),
  );

  expect(commensInBloggerPosts.items.length).toBe(0);

  await commandBus.execute(
    new UserAddCommentCommand(
      'test comment',
      postInFirstBlog.id,
      userAsReader.id,
    ),
  );

  commensInBloggerPosts = await queryBus.execute(
    new BloggerGetCommentsForCurrentUserBlogsQuery(
      userAsBlogger.id,
      'createdAt',
      'desc',
      1,
      10,
    ),
  );

  expect(commensInBloggerPosts.items.length).toBe(1);
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

  postInFirstBlog = await commandBus.execute(
    new BloggerCreatePostCommand(
      'test post title',
      'test post short description',
      'test post content',
      firstBlog._id.toString(),
      userAsBlogger._id.toString(),
    ),
  );

  userAsReader = await commandBus.execute(
    new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
  );
}
