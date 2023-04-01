import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RequestsMaker } from '../requestsMaker';
import { Given } from '../../xxx/testEntities/Given';

describe('POST /auth/login', () => {
  let configuredTestApp: INestApplication;
  let app: any;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    const given = new Given(app);
    await given.clearDb();

    const user1 = await given.adminAddUserToSystem('user1');
    await user1.authLogin();

    await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('return JWT token, Status 201', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'user1',
        password: '123456',
      })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });
});
