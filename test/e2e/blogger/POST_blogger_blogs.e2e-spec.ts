import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { faker } from '@faker-js/faker';
import { checkFieldsInErrorMessage } from '../responseChecker';

const endPointUrl = '/blogger/blogs';

describe(`POST ${endPointUrl} (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let sendTestRequest: (
    dto: any,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

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
    const { accessToken } = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    sendTestRequest = async (dto, status): Promise<request.Response> => {
      return request(app)
        .post(endPointUrl)
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);
    };
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).post(endPointUrl).send().expect(HttpStatus.UNAUTHORIZED);
  });

  describe('Invalid input data in DTO. Status: 400.', () => {
    const dto = {
      name: 'second blog',
      description: 'the second blog description',
      websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
    };

    describe('name', () => {
      it('should throw an error if "name" is less than 1 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, name: faker.datatype.string(1 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['name']);
      });

      it('should throw an error if "name" is more than 15 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, name: faker.datatype.string(15 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['name']);
      });
    });

    describe('description', () => {
      it('should throw an error if "description" is less than 6 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, description: faker.datatype.string(1 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['description']);
      });

      it('should throw an error if "description" is more than 20 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, description: faker.datatype.string(500 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['description']);
      });
    });

    describe('websiteUrl', () => {
      it('should throw an error if "websiteUrl" is less than 6 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, websiteUrl: faker.datatype.string(1 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['websiteUrl']);
      });

      it('should throw an error if "websiteUrl" is more than 20 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, websiteUrl: faker.datatype.string(100 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['websiteUrl']);
      });
    });

    describe('All fields are empty', () => {
      it('should throw an error with "number" of errors', async () => {
        const response = await sendTestRequest(
          {
            name: '',
            description: '',
            websiteUrl: '',
          },
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

  it('Should "create new blog". Status 201', async () => {
    const dto = {
      name: 'second blog',
      description: 'the second blog description',
      websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
    };

    const response = await sendTestRequest(dto, HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'second blog',
      isMembership: false,
      createdAt: expect.any(String),
      description: 'the second blog description',
      websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
    });
  });
});
