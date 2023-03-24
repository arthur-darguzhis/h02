import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { ID_FOR_NOT_FOUND, RequestsMaker } from '../requestsMaker';

//TODO 1. START: Place here url of endPoint (after making this step replace "TODO" to "STEP")
const endPointUrl = '/blogger/blogs';
//STEP 1. END

describe(`DELETE ${endPointUrl} (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let tokensUser1: any;
  let tokensUser2: any;
  let blogIdOfUser1: string;
  let blogIdOfUser2: string;

  let sendTestRequest: (
    accessToken: string,
    entityId: string,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    //TODO 2. START: Prepare background for test, use "RequestsMaker" (after making this step replace "TODO" to "STEP")
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

    blogIdOfUser1 = await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser1.accessToken,
      {
        name: 'first blog',
        description: 'first blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
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
        description: 'second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );
    //STEP 2. END

    //START 3. START: Prepare "sendTestRequest" function that send the main test request; (after making this step replace "TODO" to "STEP")
    sendTestRequest = async (
      accessToken,
      entityId,
      status,
    ): Promise<request.Response> => {
      return request(app)
        .delete(endPointUrl + '/' + entityId)
        .auth(accessToken, { type: 'bearer' })
        .expect(status);
    };
    //STEP 3. END
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .delete(endPointUrl + '/' + blogIdOfUser1)
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should return error if user try to delete a "Entity" that is not it`s own. Status 404', async () => {
    await request(app)
      .delete(endPointUrl + '/' + ID_FOR_NOT_FOUND)
      .auth(tokensUser1.accessToken, { type: 'bearer' })
      .send()
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Should return error if user try to delete a "Entity" that is not it`s own. Status 403', async () => {
    await sendTestRequest(
      tokensUser1.accessToken,
      blogIdOfUser2,
      HttpStatus.FORBIDDEN,
    );
  });

  it('Should delete blog. Status 201', async () => {
    await sendTestRequest(
      tokensUser1.accessToken,
      blogIdOfUser1,
      HttpStatus.NO_CONTENT,
    );
  });
});