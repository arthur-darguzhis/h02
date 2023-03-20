import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../../requestsMaker';

describe(`GET /sa/blogs (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;
  let tokensUser1: any;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    await RequestsMaker.testing.clearDb(app);
    await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });

    tokensUser1 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser1.accessToken,
      {
        name: 'first blog',
        description: 'first blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).get('/sa/blogs').send().expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should return all blogs where current user is owner. Status 200', async () => {
    const response = await request(app)
      .get('/sa/blogs')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send()
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          name: 'first blog',
          description: 'first blog description',
          websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
          isMembership: false,
          createdAt: expect.any(String),
          blogOwnerInfo: {
            userId: expect.any(String),
            userLogin: 'user1',
          },
        },
      ],
    });
  });
});
