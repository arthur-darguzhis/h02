import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../../requestsMaker';
import { checkFieldsInErrorMessage } from '../../responseChecker';
import { faker } from '@faker-js/faker';

//STEP 1. START: Place here url of endPoint
const endPointUrl = '/sa/users';
//STEP 1. END

describe(`POST /sa/users (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  const dto = {
    login: 'user1',
    password: '123456',
    email: 'user1-test@test.test',
  };

  let sendTestRequest: (
    dto: any,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    await RequestsMaker.testing.clearDb(app);

    //STEP 3. START: Prepare "sendTestRequest" function that send the main test request;
    sendTestRequest = async (dto, status): Promise<request.Response> => {
      return request(app)
        .post(endPointUrl)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(dto)
        .expect(status);
    };
    //STEP 3. END
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  //TODO 4. START: case(s) of unauthorized. Status code 401. (after making this step replace "TODO" to "STEP")
  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).post(endPointUrl).send().expect(HttpStatus.UNAUTHORIZED);
  });
  //STEP 4. END

  //TODO 5. START: case(s) incoming DTO data is invalid. Status 400 (after making this step replace "TODO" to "STEP")
  describe('Invalid input data in DTO. Status: 400.', () => {
    //TODO change "fieldName" to field name that has some validation rules
    describe('login', () => {
      it(`should throw an error if "login" is less than 3 characters`, async () => {
        const response = await sendTestRequest(
          { ...dto, login: faker.datatype.string(3 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });

      it('should throw an error if "login" is more than 10 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, login: faker.datatype.string(10 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });
    });

    describe('login', () => {
      it(`should throw an error if "password" is less than 6 characters`, async () => {
        const response = await sendTestRequest(
          { ...dto, password: faker.datatype.string(6 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['password']);
      });

      it('should throw an error if "password" is more than 20 characters', async () => {
        const response = await sendTestRequest(
          { ...dto, password: faker.datatype.string(20 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['password']);
      });
    });

    describe('All fields are empty', () => {
      it('should throw an error with "number" of errors', async () => {
        const response = await sendTestRequest({}, HttpStatus.BAD_REQUEST);

        checkFieldsInErrorMessage(response, ['login', 'password', 'email']);
      });
    });
  });
  //STEP 5. END

  it('Should "****". Status 201', async () => {
    const response = await sendTestRequest(dto, HttpStatus.CREATED);

    expect(response.body).toEqual({
      id: expect.any(String),
      login: 'user1',
      email: 'user1-test@test.test',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    });
  });
});
