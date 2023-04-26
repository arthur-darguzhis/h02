import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { GetCommentQuery } from './get-comment.query';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { UserMakeReactionOnCommentCommand } from '../use-cases/user-make-reaction-on-comment.use-case';

describe('Should return comment', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let postsPgRepository: PostsRepository;
  let commentsPgRepository: CommentsRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let userAsReader1;
  let userAsReader2;
  let userAsReader3;
  let userAsReader4;

  let blog1;
  let post1;
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
     * Given: There is a blogger with login "blogger" with blog "First blog" and post "First post";
     * And: There is a user as 4 users with logins "reader1-reader4" and comment for "First post"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('Throw error if comment is not exists', async () => {
    await expect(
      queryBus.execute(new GetCommentQuery(UUID_THAT_IS_NOT_EXISTS)),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Comment with ID: ${UUID_THAT_IS_NOT_EXISTS} is not exists`,
      ),
    );
  });

  it('Should return comment info with "myStatus = None" if user is Guest', async () => {
    const data = await queryBus.execute(new GetCommentQuery(comment1.id));

    expect(data.likesInfo.myStatus).toBe('None');
  });

  it('Should return comment info with "myStatus = Like" if current user has a comment reaction as "Like" on the comment', async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        comment1.id,
        userAsReader2.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        comment1.id,
        userAsReader3.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        comment1.id,
        userAsReader4.id,
        'Like',
      ),
    );

    const data = await queryBus.execute(
      new GetCommentQuery(comment1.id, userAsReader1.id),
    );

    expect(data.likesInfo.myStatus).toBe('Like');
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );
    userAsBlogger = await usersPgRepository.findByLogin('blogger');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader1', '123456', 'reader1@test.test'),
    );
    userAsReader1 = await usersPgRepository.findByLogin('reader1');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader2', '123456', 'reader2@test.test'),
    );
    userAsReader2 = await usersPgRepository.findByLogin('reader2');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader3', '123456', 'reader3@test.test'),
    );
    userAsReader3 = await usersPgRepository.findByLogin('reader3');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader4', '123456', 'reader4@test.test'),
    );
    userAsReader4 = await usersPgRepository.findByLogin('reader4');

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

    post1 = await postsPgRepository.findByTitleAndBlog(
      'test post1 title',
      blog1.id,
    );

    await commandBus.execute(
      new UserAddCommentCommand('some comment', post1.id, userAsReader1.id),
    );

    comment1 = await commentsPgRepository.forTest_findOne(
      post1.id,
      userAsReader1.id,
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        comment1.id,
        userAsReader1.id,
        'Like',
      ),
    );
  }
});
