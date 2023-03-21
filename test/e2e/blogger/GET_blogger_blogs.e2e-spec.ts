import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { checkFieldsInErrorMessage } from '../responseChecker';

//TODO 1. START: Place here url of endPoint (after making this step replace "TODO" to "STEP")
const endPointUrl = '/blogger/blogs';
//STEP 1. END

describe(`GET ${endPointUrl} (e2e)`, () => {
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

    await RequestsMaker.users.createUser(app, {
      login: 'user2',
      password: '123456',
      email: 'user2-test@test.test',
    });
    const tokensUser2 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user2',
      password: '123456',
    });

    await RequestsMaker.blogger.createNewBlog(
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

    //TODO 3. START: Prepare "sendTestRequest" function that send the main test request; (after making this step replace "TODO" to "STEP")
    sendTestRequest = async (dto, status): Promise<request.Response> => {
      return request(app)
        .get(endPointUrl)
        .query(dto)
        .auth(tokensUser1.accessToken, { type: 'bearer' })
        .send()
        .expect(status);
    };
    //STEP 3. END
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  //TODO 4. START: case(s) of unauthorized. Status code 401. (after making this step replace "TODO" to "STEP")
  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).get(endPointUrl).send().expect(HttpStatus.UNAUTHORIZED);
  });
  //STEP 4. END

  //TODO 5. START: case(s) incoming DTO data is invalid. Status 400 (after making this step replace "TODO" to "STEP")
  describe('Invalid input data in DTO. Status: 400.', () => {
    //TODO define fields that have to be validated
    const dto = {
      sortBy: 'name',
    };

    //TODO Press "CMD + J" and type "checkValidation" choose necessary rules for checking validation

    it('should throw an error if "sortBy" is not one of the following: name, description, websiteUrl, createdAt.', async () => {
      const response = await sendTestRequest(
        { ...dto, sortBy: 'nonexistent property' },
        HttpStatus.BAD_REQUEST,
      );
      //TODO set here break point ant then take info from response.body.errorsMessages[0].response.body.errorsMessages[0].message
      checkFieldsInErrorMessage(response, ['sortBy']);
    });
  });
  //STEP 5. END

  //TODO 6. START: case(s) of success Status code 200, 201, 204. (after making this step replace "TODO" to "STEP")
  //TODO 7. change description of this test (remove this TODO after implementation)
  it('Should return all blogs where current user is owner. Status 200', async () => {
    const dto = {};

    const response = await sendTestRequest(dto, HttpStatus.OK);
    //TODO 11 set here breakpoint and whe debuger will be here look at "response.body" variable and move here the json.
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
        },
      ],
    });
  });
});
