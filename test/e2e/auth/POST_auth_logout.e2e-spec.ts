import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';

describe('POST /auth/login', () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let cookie: string;

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

    const result = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    cookie = result.cookie;
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should logout user remove session and cookies. Status 204', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Cookie', [...cookie])
      .send()
      .expect(HttpStatus.NO_CONTENT);
  });
});
