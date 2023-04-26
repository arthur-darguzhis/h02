import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { PostsPgRepository } from '../../infrastructure/posts-pg.repository';
import { UserAddCommentCommand } from './user-add-comment.use-case';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { CommentsPgRepository } from '../../../comments/infrastructure/comments-pg.repository';

describe('User add comment to a post', () => {
  let given: Given;
  let usersPgRepository: UsersRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commentsPgRepository: CommentsPgRepository;
  let commandBus: CommandBus;

  let userAsBlogger;
  let userAsReader;
  let firstBlog;
  let firstPost;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);
    commentsPgRepository = given.configuredTestApp.get(CommentsPgRepository);
    commandBus = given.configuredTestApp.get(CommandBus);

    /** Arrange
     * Given: There is a user as blogger with login "blogger" with blog and post
     * And: There is a user as reader with login "reader"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  //TODO добавить кейс когда пользователь пытается оставить комментарий к посту куда доступ ему заблокирован.
  it(`Reader create a comment on a post.`, async () => {
    await commandBus.execute(
      new UserAddCommentCommand('test comment', firstPost.id, userAsReader.id),
    );

    const comment = await commentsPgRepository.forTest_findOne(
      firstPost.id,
      userAsReader.id,
    );

    expect(comment).not.toBeNull();
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
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );

    await commandBus.execute(
      new BloggerCreatePostCommand(
        'first post',
        'short description for the first post',
        'some context for the first post',
        firstBlog.id,
        userAsBlogger.id,
      ),
    );

    firstPost = await postsPgRepository.findByTitleAndBlog(
      'first post',
      firstBlog.id,
    );

    userAsReader = await usersPgRepository.findByLogin('reader');
  }
});
