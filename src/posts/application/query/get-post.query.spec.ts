import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../../../super-admin/users/use-cases/admin-add-new-user.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { BloggerCreateBlogCommand } from '../../../blogger/application/use-cases/blogger-create-blog.use-case';
import { BlogsPgRepository } from '../../../blogs/infrastructure/blogs-pg.repository';
import { BloggerCreatePostCommand } from '../../../blogger/application/use-cases/blogger-create-post.use-case';
import { PostsPgRepository } from '../../infrastructure/posts-pg.repository';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { GetPostQuery } from './get-post.query';
import { UserMakeReactionOnPostCommand } from '../use-cases/user-make-reaction-on-post.use-case';

describe('Should return a post', () => {
  let given: Given;
  let usersPgRepository: UsersPgRepository;
  let blogsPgRepository: BlogsPgRepository;
  let postsPgRepository: PostsPgRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let userAsBlogger;
  let userAsReader;

  let blog1;
  let post1;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    blogsPgRepository = given.configuredTestApp.get(BlogsPgRepository);
    postsPgRepository = given.configuredTestApp.get(PostsPgRepository);

    /** Arrange
     * Given: There is a blogger with login "blogger" with blog "First blog" and post "First post";
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('Throw error if comment is not exists', async () => {
    await expect(
      queryBus.execute(new GetPostQuery(UUID_THAT_IS_NOT_EXISTS)),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Post with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it('Should return comment info with "myStatus = None" if user is Guest', async () => {
    const data = await queryBus.execute(new GetPostQuery(post1.id));

    expect(data.extendedLikesInfo.myStatus).toBe('None');
  });

  it('Should return comment info with "myStatus = Like" if current user has a comment reaction as "Like" on the comment', async () => {
    const data = await queryBus.execute(
      new GetPostQuery(post1.id, userAsReader.id),
    );

    expect(data.extendedLikesInfo.myStatus).toBe('Like');
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('blogger', '123456', 'blogger@test.test'),
    );
    userAsBlogger = await usersPgRepository.findByLogin('blogger');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader', '123456', 'reader@test.test'),
    );
    userAsReader = await usersPgRepository.findByLogin('reader');

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
      new UserMakeReactionOnPostCommand(post1.id, userAsReader.id, 'Like'),
    );
  }
});
