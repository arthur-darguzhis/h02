import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';

describe('DELETE /security/devices (e2e)', () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let cookies1user: string;
  let cookies2user: string;

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

    //first login session for user1
    await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    //second login session for user1
    const responseForUser1 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    cookies1user = responseForUser1.cookie;

    await RequestsMaker.users.createUser(app, {
      login: 'user2',
      password: '123456',
      email: 'user2-test@test.test',
    });

    const responseForUser2 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user2',
      password: '123456',
    });

    cookies2user = responseForUser2.cookie;
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should purge specific device session. Status 200', async () => {
    const activeSessionsResponseBefore = await request(app)
      .get('/security/devices')
      .set('Cookie', [...cookies1user])
      .send()
      .expect(HttpStatus.OK);

    expect(activeSessionsResponseBefore.body.length).toBe(2);

    const deviceIdToRemove = activeSessionsResponseBefore.body[0].deviceId;
    await request(app)
      .delete('/security/devices/' + deviceIdToRemove)
      .set('Cookie', [...cookies1user])
      .send()
      .expect(HttpStatus.NO_CONTENT);

    const activeSessionsResponseAfter = await request(app)
      .get('/security/devices')
      .set('Cookie', [...cookies1user])
      .send()
      .expect(HttpStatus.OK);

    expect(activeSessionsResponseAfter.body.length).toBe(1);
  });
});
