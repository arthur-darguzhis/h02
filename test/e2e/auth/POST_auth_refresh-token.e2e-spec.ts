import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('POST /auth/refresh-token (e2e)', () => {
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

  it('Should take new pair of accessToken and refreshToken and update current device user session. Status 204', async () => {
    const refreshTokenResponse = await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', [...cookie])
      .send()
      .expect(HttpStatus.OK);

    expect(refreshTokenResponse.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(refreshTokenResponse.header['set-cookie'][0]).toMatch(
      'refreshToken',
    );
  });

  it('An error should occur if the user attempts to refresh their token twice, with the second attempt using the same old token. Status 401', async () => {
    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', [...cookie])
      .send()
      .expect(HttpStatus.OK);

    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', [...cookie])
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
