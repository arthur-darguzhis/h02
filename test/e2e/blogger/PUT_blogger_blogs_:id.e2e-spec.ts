import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { checkFieldsInErrorMessage } from '../responseChecker';
import { faker } from '@faker-js/faker';

//STEP 1. START: Place here url of endPoint
const endPointUrl = '/blogger/blogs';
//STEP 1. END

describe(`PUT ${endPointUrl} (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let tokensUser1: any;
  let tokensUser2: any;
  let blogIdOfUser1: string;
  let blogIdOfUser2: string;

  let sendTestRequest: (
    accessToken: string,
    dto: any,
    entityId: string,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    //STEP 2. START: Prepare background for test, use "RequestsMaker" (after making this step replace "TODO" to "STEP")
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

    //STEP 3. START: Prepare "sendTestRequest" function that send the main test request;
    sendTestRequest = async (
      accessToken,
      dto,
      entityId,
      status,
    ): Promise<request.Response> => {
      return request(app)
        .put(endPointUrl + '/' + entityId)
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);
    };
    //STEP 3. END
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  //STEP 4. START: case(s) of unauthorized. Status code 401.
  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .put(endPointUrl + '/' + blogIdOfUser1)
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });
  //STEP 4. END

  //STEP 5. START: case(s) incoming DTO data is invalid. Status 400
  describe('Invalid input data in DTO. Status: 400.', () => {
    const dto = {
      name: 'updated name',
      description: 'updated first blog description',
      websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
    };

    describe('name', () => {
      it(`should throw an error if "name" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, name: faker.datatype.string(1 - 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['name']);
      });

      it('should throw an error if "name" is more than 15 characters', async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, name: faker.datatype.string(15 + 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['name']);
      });
    });

    describe('description', () => {
      it(`should throw an error if "description" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, description: faker.datatype.string(1 - 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['description']);
      });

      it('should throw an error if "description" is more than 500 characters', async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, description: faker.datatype.string(500 + 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['description']);
      });
    });

    describe('websiteUrl', () => {
      it(`should throw an error if "websiteUrl" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, websiteUrl: faker.datatype.string(1 - 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['websiteUrl']);
      });

      it('should throw an error if "websiteUrl" is more than 100 characters', async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          { ...dto, websiteUrl: faker.datatype.string(100 + 1) },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['websiteUrl']);
      });
    });

    describe('All fields are empty', () => {
      it('should throw an error with "number" of errors', async () => {
        const response = await sendTestRequest(
          tokensUser1.accessToken,
          {
            name: '',
            description: '',
            websiteUrl: '',
          },
          blogIdOfUser1,
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          'name',
          'description',
          'websiteUrl',
        ]);
      });
    });
  });
  //STEP 5. END

  //STEP 6. START: case(s) if user try to update that does not belong to him.
  it('Should return error if user try to update a "Entity" that is not it`s own', async () => {
    const response = await sendTestRequest(
      tokensUser1.accessToken,
      {
        name: 'updated name',
        description: 'updated first blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      blogIdOfUser2,
      HttpStatus.FORBIDDEN,
    );
  });
  //STEP 6. END

  it('Should update blog. Status 201', async () => {
    const dto = {
      name: 'updated name',
      description: 'updated first blog description',
      websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
    };

    await sendTestRequest(
      tokensUser1.accessToken,
      dto,
      blogIdOfUser1,
      HttpStatus.NO_CONTENT,
    );
  });
});
