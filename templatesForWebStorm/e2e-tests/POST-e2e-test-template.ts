import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { faker } from '@faker-js/faker';
import { checkFieldsInErrorMessage } from '../responseChecker';

//TODO 1. START: Place here url of endPoint (after making this step replace "TODO" to "STEP")
const endPointUrl = '/';
//STEP 1. END

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

    //TODO 2. START: Prepare background for test, use "RequestsMaker" (after making this step replace "TODO" to "STEP")
    await RequestsMaker.testing.clearDb(app);
    await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });
    const { accessToken } = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });
    //STEP 2. END

    //TODO 3. START: Prepare "sendTestRequest" function that send the main test request; (after making this step replace "TODO" to "STEP")
    sendTestRequest = async (dto, status): Promise<request.Response> => {
      return request(app)
        .post(endPointUrl)
        .auth(accessToken, { type: 'bearer' })
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
    const dto = {
      //TODO place here DTO structure with correct data
    };

    //TODO change "fieldName" to field name that has some validation rules
    describe('fieldName', () => {
      //TODO Press "CMD + J" and type "checkValidation" choose necessary rules for checking validation
    });

    describe('All fields are empty', () => {
      it('should throw an error with "number" of errors', async () => {
        const response = await sendTestRequest(
          {
            //TODO put here dto structure with empty fields ''
          },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          //TODO put here all field names
        ]);
      });
    });
  });
  //STEP 5. END

  //TODO 6. START: case(s) of success Status code 200, 201, 204. (after making this step replace "TODO" to "STEP")
  //TODO 7. place this case to RequestMaker object. it will be reused for preparing background for other tests. (remove this TODO after implementation)
  //TODO 8. change description of this test (remove this TODO after implementation)
  it('Should "****". Status 201', async () => {
    const dto = {
      //TODO 9 here put a DTO structure with valid values
    };

    const response = await sendTestRequest(dto, HttpStatus.CREATED);

    //TODO 11 set here breakpoint and whe debuger will be here look at "response.body" variable and move here the json.
    expect(response.body).toEqual({
      id: expect.any(String),
    });
  });
});
