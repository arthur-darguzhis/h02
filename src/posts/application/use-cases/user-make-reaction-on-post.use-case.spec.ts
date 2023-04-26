import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';

import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { UserMakeReactionOnPostCommand } from './user-make-reaction-on-post.use-case';
import { wait } from '../../../testing/wait';

describe('User make reaction on post', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsRepository;
  let postsPgRepository: PostsRepository;

  let userAsBlogger;
  let firstBlog;
  let postInFirstBlog;
  let reader1;
  let reader2;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsRepository);
    commandBus = given.configuredTestApp.get(CommandBus);
    postsPgRepository = given.configuredTestApp.get(PostsRepository);

    /** Arrange
     * Given: There is blogger with "blogger" login and "first post" post
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
        new UserMakeReactionOnPostCommand(
          UUID_THAT_IS_NOT_EXISTS,
          reader2.id,
          'Like',
        ),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Post with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`User "Like" comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(1);
    expect(post.dislikesCount).toBe(0);
    expect(post.newestLikes.length).toBe(1);
  });

  it(`2 Users "Like" comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader1.id, 'Like'),
    );

    await wait(2000);
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(2);
    expect(post.dislikesCount).toBe(0);
    expect(post.newestLikes.length).toBe(2);
    expect(post.newestLikes[0].login).toBe(reader2.login);
    expect(post.newestLikes[1].login).toBe(reader1.login);
  });

  it(`User "Like" comment 2 times "likesCount" is 1`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(1);
    expect(post.dislikesCount).toBe(0);
    expect(post.newestLikes.length).toBe(1);
  });

  it(`User "Dislike" comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        postInFirstBlog.id,
        reader2.id,
        'Dislike',
      ),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(0);
    expect(post.dislikesCount).toBe(1);
    expect(post.newestLikes.length).toBe(0);
  });

  it(`User "Like" comment and then "Dislike"`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'Like'),
    );

    await commandBus.execute(
      new UserMakeReactionOnPostCommand(
        postInFirstBlog.id,
        reader2.id,
        'Dislike',
      ),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(0);
    expect(post.dislikesCount).toBe(1);
    expect(post.newestLikes.length).toBe(0);
  });

  it(`User reaction is "None" on a comment`, async () => {
    await commandBus.execute(
      new UserMakeReactionOnPostCommand(postInFirstBlog.id, reader2.id, 'None'),
    );

    const post = await postsPgRepository.findById(postInFirstBlog.id);
    expect(post.likesCount).toBe(0);
    expect(post.dislikesCount).toBe(0);
    expect(post.newestLikes.length).toBe(0);
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
  }
});
