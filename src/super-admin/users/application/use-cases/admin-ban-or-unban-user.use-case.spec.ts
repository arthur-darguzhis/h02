import { Given } from '../../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { AdminAddNewUserCommand } from './admin-add-new-user.use-case';
import { AdminBanOrUnbanUserCommand } from './admin-ban-or-unban-user.use-case';
import { LoginCommand } from '../../../../auth/application/use-cases/login.use-case';
import { UserSessionsPgRepository } from '../../../../security/infrastructure/user-sessions-pg.repository';
import { UnprocessableEntityException } from '../../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { BloggerCreateBlogCommand } from '../../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../../blogs/infrastructure/blogs-pg.repository';
import { BloggerCreatePostCommand } from '../../../../blogger/application/use-cases/blogger-create-post.use-case';
import { PostsPgRepository } from '../../../../posts/infrastructure/posts-pg.repository';
import { UserMakeReactionOnPostCommand } from '../../../../posts/application/use-cases/user-make-reaction-on-post.use-case';
import { UserAddCommentCommand } from '../../../../posts/application/use-cases/user-add-comment.use-case';
import { UserMakeReactionOnCommentCommand } from '../../../../comments/application/use-cases/user-make-reaction-on-comment.use-case';
import { CommentsPgRepository } from '../../../../comments/infrastructure/comments-pg.repository';

describe('Admin ban or unban user use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let userSessionsPgRepository: UserSessionsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commentsPgRepository: CommentsPgRepository;

  let userAsBlogger;
  let firstBlog;
  let postInFirstBlog;
  let reader1;
  let commentOfFirstUser;
  let reader2;
  let commentOfSecondUser;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
    commentsPgRepository = given.configuredTestApp.get(CommentsPgRepository);
    userSessionsPgRepository = given.configuredTestApp.get(
      UserSessionsPgRepository,
    );

    /** Arrange
     * Given: There is a blogger with "blogger" login and "first blog" blog and "first post" post:
     * And: There are user with "reader1" login,
     * And: There is a user with "reader2" login
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when admin ban user and user is already banned`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('blogger@test.test');
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(user.id, true, 'abuse behaviour'),
    );

    //Act & Assert
    await expect(
      commandBus.execute(
        new AdminBanOrUnbanUserCommand(user.id, true, 'abuse behaviour'),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException('The user is already banned'),
    );
  });

  it(`throw when admin unban user and user is already unbanned`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('blogger@test.test');

    //Act & Assert
    await expect(
      commandBus.execute(new AdminBanOrUnbanUserCommand(user.id, false, '')),
    ).rejects.toThrow(
      new UnprocessableEntityException('The user is already active'),
    );
  });

  it(`Check that all user sessions are removed after admin ban user`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('blogger@test.test');
    await commandBus.execute(new LoginCommand(user, '127.0.0.1', 'jest'));

    //Act
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(userAsBlogger.id, true, 'abuse behaviour'),
    );

    //Assert
    const userSessions = await userSessionsPgRepository.forTest_findByUserId(
      user.id,
    );
    expect(userSessions).toEqual([]);
  });

  it(`Successfully ban user`, async () => {
    //Act
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(userAsBlogger.id, true, 'abuse behaviour'),
    );

    //Assert
    const updatedUser = await usersPgRepository.getByEmail('blogger@test.test');
    expect(updatedUser.banDate).not.toBeNull();
    expect(updatedUser.isBanned).toBe(true);
    expect(updatedUser.banReason).toBe('abuse behaviour');

    const blog = await blogsPgRepository.getById(firstBlog.id);
    expect(blog.isBanned).toBe(true);

    const post = await postsPgRepository.getById(postInFirstBlog.id);
    expect(post.isBanned).toBe(true);
    expect(post.likesCount).toBe(2);
    expect(post.dislikesCount).toBe(0);

    const firstComment = await commentsPgRepository.getById(
      commentOfFirstUser.id,
    );
    expect(firstComment.likesCount).toBe(2);
    expect(firstComment.dislikesCount).toBe(0);

    const secondComment = await commentsPgRepository.getById(
      commentOfSecondUser.id,
    );
    expect(secondComment.likesCount).toBe(2);
    expect(secondComment.dislikesCount).toBe(0);
  });

  it(`Successfully unban user`, async () => {
    //Assert
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(userAsBlogger.id, true, 'abuse behaviour'),
    );

    //Act
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(userAsBlogger.id, false, ''),
    );

    //Assert
    const updatedUser = await usersPgRepository.getByEmail('blogger@test.test');
    expect(updatedUser.banDate).toBeNull();
    expect(updatedUser.isBanned).toBe(false);
    expect(updatedUser.banReason).toBeNull();

    const blog = await blogsPgRepository.getById(firstBlog.id);
    expect(blog.isBanned).toBe(false);

    const post = await postsPgRepository.getById(postInFirstBlog.id);
    expect(post.isBanned).toBe(false);
    expect(post.likesCount).toBe(3);
    expect(post.dislikesCount).toBe(0);

    const firstComment = await commentsPgRepository.getById(
      commentOfFirstUser.id,
    );
    expect(firstComment.likesCount).toBe(3);
    expect(firstComment.dislikesCount).toBe(0);

    const secondComment = await commentsPgRepository.getById(
      commentOfSecondUser.id,
    );
    expect(secondComment.likesCount).toBe(3);
    expect(secondComment.dislikesCount).toBe(0);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('reader1', '123456', 'reader1@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader2', '123456', 'reader2@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );

    userAsBlogger = await usersPgRepository.findByLogin('blogger');
    reader1 = await usersPgRepository.findByLogin('reader1');
    reader2 = await usersPgRepository.findByLogin('reader2');

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
        'short description for the first post',
        'some context for the first post',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    postInFirstBlog = await postsPgRepository.findByTitleAndBlog(
      'first post',
      firstBlog.id,
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader1.id, 'Like'),
    );
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        postInFirstBlog.id,
        userAsBlogger.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserAddCommentCommand('test comment', postInFirstBlog.id, reader1.id),
    );

    await commandBus.execute(
      new UserAddCommentCommand('test comment', postInFirstBlog.id, reader2.id),
    );

    commentOfFirstUser = await commentsPgRepository.forTest_findOne(
      postInFirstBlog.id,
      reader1.id,
    );

    commentOfSecondUser = await commentsPgRepository.forTest_findOne(
      postInFirstBlog.id,
      reader2.id,
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfFirstUser.id,
        reader1.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfFirstUser.id,
        reader2.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfFirstUser.id,
        userAsBlogger.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfSecondUser.id,
        reader1.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfSecondUser.id,
        reader2.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfSecondUser.id,
        userAsBlogger.id,
        'Like',
      ),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.newestLikes.length).toBe(3);
    expect(post.likesCount).toBe(3);

    const firstComment = await commentsPgRepository.getById(
      commentOfFirstUser.id,
    );
    expect(firstComment.likesCount).toBe(3);
    expect(firstComment.dislikesCount).toBe(0);

    const secondComment = await commentsPgRepository.getById(
      commentOfSecondUser.id,
    );
    expect(secondComment.likesCount).toBe(3);
    expect(secondComment.dislikesCount).toBe(0);
  }
});
