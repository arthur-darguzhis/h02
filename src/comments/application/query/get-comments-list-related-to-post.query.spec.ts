import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { GetCommentsListRelatedToPostQuery } from './get-comments-list-related-to-post.query';
import { UserMakeReactionOnCommentCommand } from '../use-cases/user-make-reaction-on-comment.use-case';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { AdminBanOrUnbanUserCommand } from '../../../super-admin/users/application/use-cases/admin-ban-or-unban-user.use-case';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';

describe('Should return list of comments related to a special post', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let postsPgRepository: PostsRepository;
  let commentsPgRepository: CommentsRepository;
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
  let comment1;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);
    postsPgRepository = given.configuredTestApp.get(PostsRepository);
    commentsPgRepository = given.configuredTestApp.get(CommentsRepository);

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
        new GetCommentsListRelatedToPostQuery(
          UUID_THAT_IS_NOT_EXISTS,
          'createdAt',
          'desc',
          10,
          1,
        ),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Post with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`Get list of comments in a post as guest`, async () => {
    const data = await queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postInFirstBlog.id,
        'createdAt',
        'desc',
        10,
        1,
      ),
    );

    expect(data.items.length).toBe(5);
  });

  it(`Get list of comments in a post as "userAsReader1"`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        comment1.id,
        userAsReader1.id,
        'Like',
      ),
    );

    const data = await queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postInFirstBlog.id,
        'createdAt',
        'asc',
        10,
        1,
        userAsReader1.id,
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].likesInfo.myStatus).toBe('Like');
  });

  it(`Check that there is no any banned comments`, async () => {
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(userAsReader1.id, true, 'bad behaviour'),
    );

    const data = await queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postInFirstBlog.id,
        'createdAt',
        'asc',
        10,
        1,
        userAsReader1.id,
      ),
    );

    expect(data.items.length).toBe(4);
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postInFirstBlog.id,
        'createdAt',
        'asc',
        10,
        1,
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].content).toBe('comment from first user');
    expect(data.items[4].content).toBe('comment from fifth user');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postInFirstBlog.id,
        'createdAt',
        'asc',
        2,
        3,
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

    comment1 = await commentsPgRepository.forTest_findOne(
      postInFirstBlog.id,
      userAsReader1.id,
    );
  }
});
