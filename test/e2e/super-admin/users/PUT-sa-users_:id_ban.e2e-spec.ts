import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../../requestsMaker';

//Очень сырой тест он не проверят забаненность коммента лайка по постам и по комментам и не проводти потом чтения.
describe(`PUT /sa/users/:userId/ban (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let userId: any;
  let token: any;
  let blogId: string;
  let postId: string;
  let commentId: string;
  let commentLikeId: string;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    await RequestsMaker.testing.clearDb(app);
    userId = await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });

    token = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    blogId = await RequestsMaker.blogger.createNewBlog(
      app,
      token.accessToken,
      {
        name: 'first blog',
        description: 'first blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );

    postId = await RequestsMaker.blogger.createNewPost(
      app,
      token.accessToken,
      blogId,
      {
        title: 'Управление состоянием в React',
        shortDescription: 'Все мы прекрасно знаем что построит...',
        content: 'Буквально каждую конференцию мы слышим от !',
      },
      HttpStatus.CREATED,
    );

    commentId = await RequestsMaker.userAddCommentToPost(
      app,
      token.accessToken,
      postId,
      { content: 'this is a sample of a correct comment that can be saved' },
    );

    commentLikeId = await RequestsMaker.userLikeComment(
      app,
      token.accessToken,
      postId,
    );

    await RequestsMaker.users.createUser(app, {
      login: 'user2',
      password: '123456',
      email: 'user2-test@test.test',
    });
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .put(`/sa/users/${userId}/ban`)
      .send({ isBanned: true, banReason: 'stringstringstringst' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should ban user by Id. Status 204', async () => {
    const response1 = await request(app)
      .get(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send();

    await request(app)
      .put(`/sa/users/${userId}/ban`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send({ isBanned: true, banReason: 'stringstringstringst' })
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app)
      .get(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send();

    const response2 = await request(app)
      .get(`/sa/users`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send();

    const b = 10;
  });
});
