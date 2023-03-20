import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../../requestsMaker';

describe(`PUT sa/blogs/:blogId/bind-with-user/:userId (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let userId: string;
  let blogId: string;
  let userTokens: any;
  let blogIdWithOwner: string;

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

    userTokens = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    blogId = await RequestsMaker.blogs.adminCreateNewBlog(app, {
      name: 'first blog',
      description: 'the first blog description',
      websiteUrl: 'https://habr.com/ru/users/AlekDikarev/',
    });

    blogIdWithOwner = await RequestsMaker.blogger.createNewBlog(
      app,
      userTokens.accessToken,
      {
        name: 'second blog',
        description: 'second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .put(`/sa/blogs/${blogId}/bind-with-user/${userId}`)
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should return error if auth credentials are incorrect. Status 400', async () => {
    await request(app)
      .put(`/sa/blogs/${blogIdWithOwner}/bind-with-user/${userId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send()
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('Should set user as owner to an orphan blog. Status 201', async () => {
    await request(app)
      .put(`/sa/blogs/${blogId}/bind-with-user/${userId}`)
      .auth('admin', 'qwerty', { type: 'basic' })
      .send()
      .expect(HttpStatus.NO_CONTENT);
  });
});
