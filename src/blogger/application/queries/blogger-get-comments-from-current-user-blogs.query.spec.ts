import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { BloggerCreateBlogCommand } from '../use-cases/blogger-create-blog.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';
import { BloggerCreatePostCommand } from '../use-cases/blogger-create-post.use-case';
import { BloggerGetCommentsFromCurrentUserBlogsQuery } from './blogger-get-comments-from-current-user-blogs.query';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

describe('Should return list of banned users in a blog', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let postsPgRepository: PostsRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let firstBlog;
  let postInFirstBlog;
  let userAsReader1;
  let userAsReader2;
  let userAsReader3;
  let userAsReader4;
  let userAsReader5;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);
    postsPgRepository = given.configuredTestApp.get(PostsRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger" and blog "First Blog";
     * And: There are 5 banned users.
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Throw error if post is not exists`, async () => {
    await expect(
      queryBus.execute(
        new BloggerGetCommentsFromCurrentUserBlogsQuery(
          UUID_THAT_IS_NOT_EXISTS,
          'createdAt',
          'desc',
          10,
          1,
        ),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `User with id: ${UUID_THAT_IS_NOT_EXISTS} is not exists`,
        'login',
      ),
    );
  });

  it(`Get comments list in current user blogs`, async () => {
    const data = await queryBus.execute(
      new BloggerGetCommentsFromCurrentUserBlogsQuery(
        userAsBlogger.id,
        'createdAt',
        'desc',
        1,
        10,
      ),
    );

    expect(data.items.length).toBe(5);
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new BloggerGetCommentsFromCurrentUserBlogsQuery(
        userAsBlogger.id,
        'createdAt',
        'asc',
        1,
        10,
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].content).toBe('comment from first user');
    expect(data.items[4].content).toBe('comment from fifth user');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new BloggerGetCommentsFromCurrentUserBlogsQuery(
        userAsBlogger.id,
        'createdAt',
        'asc',
        3,
        2,
      ),
    );

    expect(data.page).toBe(3);
    expect(data.items.length).toBe(1);
    expect(data.items[0].content).toBe('comment from fifth user');
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
        'first post',
        'short description for the first post',
        'some content',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    postInFirstBlog = await postsPgRepository.findByTitleAndBlog(
      'first post',
      firstBlog.id,
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('first reader', '123456', 'reader1@test.test'),
    );

    userAsReader1 = await usersPgRepository.findByLogin('first reader');

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'second reader',
        '123456',
        'reader2@test.test',
      ),
    );

    userAsReader2 = await usersPgRepository.findByLogin('second reader');

    await commandBus.execute(
      new AdminAddNewUserCommand('third reader', '123456', 'reader3@test.test'),
    );

    userAsReader3 = await usersPgRepository.findByLogin('third reader');

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'fourth reader',
        '123456',
        'reader4@test.test',
      ),
    );

    userAsReader4 = await usersPgRepository.findByLogin('fourth reader');

    await commandBus.execute(
      new AdminAddNewUserCommand('fifth reader', '123456', 'reader5@test.test'),
    );

    userAsReader5 = await usersPgRepository.findByLogin('fifth reader');

    await commandBus.execute(
      new UserAddCommentCommand(
        'comment from first user',
        postInFirstBlog.id,
        userAsReader1.id,
      ),
    );

    await commandBus.execute(
      new UserAddCommentCommand(
        'comment from second user',
        postInFirstBlog.id,
        userAsReader2.id,
      ),
    );

    await commandBus.execute(
      new UserAddCommentCommand(
        'comment from third user',
        postInFirstBlog.id,
        userAsReader3.id,
      ),
    );

    await commandBus.execute(
      new UserAddCommentCommand(
        'comment from fourth user',
        postInFirstBlog.id,
        userAsReader4.id,
      ),
    );

    await commandBus.execute(
      new UserAddCommentCommand(
        'comment from fifth user',
        postInFirstBlog.id,
        userAsReader5.id,
      ),
    );
  }
});
