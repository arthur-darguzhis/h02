import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { UserAddCommentCommand } from '../../../posts/application/use-cases/user-add-comment.use-case';
import { CommentsPgRepository } from '../../infrastructure/comments-pg.repository';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { UserMakeReactionOnCommentCommand } from './user-make-reaction-on-comment.use-case';

describe('User make reaction on comment', () => {
  let given: Given;
  let usersPgRepository: UsersPgRepository;
  let blogsPgRepository: BlogsPgRepository;
  let commandBus: CommandBus;
  let postsPgRepository: PostsPgRepository;
  let commentsPgRepository: CommentsPgRepository;

  let userAsBlogger;

  let firstBlog;
  let postInFirstBlog;
  let reader1;
  let reader2;
  let commentOfReader1;
  let commentOfReader2;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
    commentsPgRepository = given.configuredTestApp.get(CommentsPgRepository);

    /** Arrange
     * Given: There is a blogger with "blogger" login and "first post" post
     * And: There are 2 users with "reader1" and "reader2" logins
     * And: reader1 and reader2 send a comments for the "first post"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Throw error if comment does not exists`, async () => {
    await expect(
      commandBus.execute(
        new UserMakeReactionOnCommentCommand(
          UUID_THAT_IS_NOT_EXISTS,
          reader2.id,
          'Like',
        ),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Comment with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`User "Like" comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Like',
      ),
    );

    const comment = await commentsPgRepository.findById(commentOfReader1.id);
    expect(comment.likesCount).toBe(1);
    expect(comment.dislikesCount).toBe(0);
  });

  it(`User "Like" comment 2 times "likesCount" is 1`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Like',
      ),
    );
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Like',
      ),
    );

    const comment = await commentsPgRepository.findById(commentOfReader1.id);
    expect(comment.likesCount).toBe(1);
    expect(comment.dislikesCount).toBe(0);
  });

  it(`User "Dislike" comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Dislike',
      ),
    );

    const comment = await commentsPgRepository.findById(commentOfReader1.id);
    expect(comment.likesCount).toBe(0);
    expect(comment.dislikesCount).toBe(1);
  });

  it(`User "Like" comment and then "Dislike"`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Like',
      ),
    );

    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'Dislike',
      ),
    );

    const comment = await commentsPgRepository.findById(commentOfReader1.id);
    expect(comment.likesCount).toBe(0);
    expect(comment.dislikesCount).toBe(1);
  });

  it(`User reaction is "None" on a comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentOfReader1.id,
        reader2.id,
        'None',
      ),
    );

    const comment = await commentsPgRepository.findById(commentOfReader1.id);
    expect(comment.likesCount).toBe(0);
    expect(comment.dislikesCount).toBe(0);
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

    await commandBus.execute(
      new AdminAddNewUserCommand('reader1', '123456', 'reader1@test.test'),
    );
    await commandBus.execute(
      new AdminAddNewUserCommand('reader2', '123456', 'reader2@test.test'),
    );

    reader1 = await usersPgRepository.findByLogin('reader1');
    reader2 = await usersPgRepository.findByLogin('reader2');

    await commandBus.execute(
      new UserAddCommentCommand('test comment', postInFirstBlog.id, reader1.id),
    );
    await commandBus.execute(
      new UserAddCommentCommand('test comment', postInFirstBlog.id, reader2.id),
    );

    commentOfReader1 = await commentsPgRepository.forTest_findOne(
      postInFirstBlog.id,
      reader1.id,
    );
    commentOfReader2 = await commentsPgRepository.forTest_findOne(
      postInFirstBlog.id,
      reader2.id,
    );
  }
});
