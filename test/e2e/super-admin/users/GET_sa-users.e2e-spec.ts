import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../../requestsMaker';

//TODO 1. START: Place here url of endPoint (after making this step replace "TODO" to "STEP")
const endPointUrl = '/sa/users';
//STEP 1. END

describe(`GET  (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;
  let tokensUser1: any;

  let sendTestRequest: (
    dto: any,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    //STEP 2. START: Prepare background for test, use "RequestsMaker"
    await RequestsMaker.testing.clearDb(app);
    await RequestsMaker.superAdminCreateNewUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });
    //STEP 2. END
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  //TODO 4. START: case(s) of unauthorized. Status code 401. (after making this step replace "TODO" to "STEP")
  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).get(endPointUrl).send().expect(HttpStatus.UNAUTHORIZED);
  });
  //STEP 4. END

  it('Should return all blogs where current user is owner. Status 200', async () => {
    const response = await request(app)
      .get(endPointUrl)
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
          login: 'user1',
          email: 'user1-test@test.test',
          createdAt: expect.any(String),
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
        },
      ],
    });
  });
});
