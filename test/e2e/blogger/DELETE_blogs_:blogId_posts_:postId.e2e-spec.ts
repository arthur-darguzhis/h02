import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { ID_FOR_NOT_FOUND, RequestsMaker } from '../requestsMaker';

describe(`DELETE /blogger/blogs/:blogId/posts (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let tokensUser1: any;
  let tokensUser2: any;
  let blogIdOfUser1: string;
  let blogIdOfUser2: string;
  let postIdOfUser1: string;
  let postIdOfUser2: string;

  let sendTestRequest: (
    accessToken: string,
    entityId: string,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    await request(app).delete('/testing/all-data');

    await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });

    tokensUser1 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    blogIdOfUser1 = await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser1.accessToken,
      {
        name: 'second blog',
        description: 'the second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );

    postIdOfUser1 = await RequestsMaker.blogger.createNewPost(
      app,
      tokensUser1.accessToken,
      blogIdOfUser1,
      {
        title: 'Управление состоянием в React',
        shortDescription: 'Все мы прекрасно знаем что построит...',
        content: 'Буквально каждую конференцию мы слышим от !',
      },
      HttpStatus.CREATED,
    );

    await RequestsMaker.users.createUser(app, {
      login: 'user2',
      password: '123456',
      email: 'user2-test@test.test',
    });

    tokensUser2 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user2',
      password: '123456',
    });

    blogIdOfUser2 = await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser2.accessToken,
      {
        name: 'second blog',
        description: 'the second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );

    postIdOfUser2 = await RequestsMaker.blogger.createNewPost(
      app,
      tokensUser2.accessToken,
      blogIdOfUser2,
      {
        title: 'Управление состоянием в React',
        shortDescription: 'Все мы прекрасно знаем что построит...',
        content: 'Буквально каждую конференцию мы слышим от !',
      },
      HttpStatus.CREATED,
    );

    sendTestRequest = async (
      accessToken,
      entityId,
      status,
    ): Promise<request.Response> => {
      return request(app)
        .delete(`/blogger/blogs/${blogIdOfUser1}/posts/${entityId}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(status);
    };
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .delete(`/blogger/blogs/${blogIdOfUser1}/posts/${postIdOfUser1}`)
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should return error if post with postId does not exist. Status 404', async () => {
    await request(app)
      .delete(`/blogger/blogs/${blogIdOfUser1}/posts/${ID_FOR_NOT_FOUND}`)
      .auth(tokensUser1.accessToken, { type: 'bearer' })
      .send()
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Should return error if blogger try to update post that does not belong to him. Status 403', async () => {
    await request(app)
      .delete(`/blogger/blogs/${blogIdOfUser2}/posts/${postIdOfUser1}`)
      .auth(tokensUser2.accessToken, { type: 'bearer' })
      .send()
      .expect(HttpStatus.FORBIDDEN);
  });

  it('Should "update post". Status 204', async () => {
    await sendTestRequest(
      tokensUser1.accessToken,
      postIdOfUser1,
      HttpStatus.NO_CONTENT,
    );
  });
});
