import { Given } from '../../xxx/testEntities/Given';
import { HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { checkFieldsInErrorMessage } from '../responseChecker';
import { faker } from '@faker-js/faker';
import { TestUser } from '../../xxx/testEntities/TestUser';

describe('POST => /auth/registration-confirmation  (e2e)', () => {
  let given: Given;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();

    await given.newUserRegistration(
      {
        login: 'user1',
        password: '123456',
        email: 'user1@test.test',
      },
      'user1',
    );
  });

  afterEach(async () => {
    await given.closeApp();
  });

  const testRequest = async (dto, status: HttpStatus): Promise<Response> => {
    return request(given.app)
      .post('/auth/registration-confirmation')
      .send(dto)
      .expect(status);
  };

  it('It should return error if incoming data is incorrect, Status 400', async () => {
    const response = await testRequest(
      { code: faker.datatype.uuid() },
      HttpStatus.BAD_REQUEST,
    );

    checkFieldsInErrorMessage(response, [
      { field: 'code', message: 'The confirmation code is incorrect' },
    ]);
  });

  it('It should verify email and activate account when confirmationCode is valid, Status 204', async () => {
    // await testRequest({ code: faker.datatype.uuid() }, HttpStatus.NO_CONTENT);
    const b = TestUser.storage.get('user1');
  });

  it('Return error "Too many requests". Status 429', async () => {
    for (let i = 0; i < 5; i++) {
      await testRequest({}, HttpStatus.BAD_REQUEST);
    }
    await testRequest({}, HttpStatus.TOO_MANY_REQUESTS);
  });
});
