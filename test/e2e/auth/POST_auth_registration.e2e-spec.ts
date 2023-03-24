import { HttpStatus } from '@nestjs/common';
import { Given } from '../../xxx/testEntities/Given';
import { checkFieldsInErrorMessage } from '../responseChecker';
import request, { Response } from 'supertest';

describe('POST /auth/registration (e2e)', () => {
  let given: Given;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  const validDto = {
    login: 'user1',
    password: '123456',
    email: 'user1@test.test',
  };

  const testRequest = async (dto, status: HttpStatus): Promise<Response> => {
    return request(given.app)
      .post('/auth/registration')
      .send(dto)
      .expect(status);
  };

  describe('Invalid input data in DTO. Status: 400.', () => {
    describe('login', () => {
      it('Should throw an error if login is empty', async () => {
        const response = await testRequest(
          { ...validDto, login: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'login',
            message: 'login must be longer than or equal to 3 characters',
          },
        ]);
      });

      it('Should throw an error if login is less than 3 characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'aa' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'login',
            message: 'login must be longer than or equal to 3 characters',
          },
        ]);
      });

      it('Should throw an error if login is more than 10 characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'abcdefghijklmnopqrstuvwxyz' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'login',
            message: 'login must be shorter than or equal to 10 characters',
          },
        ]);
      });

      it('Should throw an error if login contains invalid characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'user@name' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'login',
            message: 'login must match /^[a-zA-Z0-9_-]*$/ regular expression',
          },
        ]);
      });
    });

    describe('password', () => {
      it('Should throw an error if password is empty', async () => {
        const response = await testRequest(
          { ...validDto, password: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'password',
            message: 'password must be longer than or equal to 6 characters',
          },
        ]);
      });

      it('Should throw an error if password is less than 6 characters', async () => {
        const response = await testRequest(
          { ...validDto, password: '12345' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'password',
            message: 'password must be longer than or equal to 6 characters',
          },
        ]);
      });

      it('Should throw an error if password is more than 20 characters', async () => {
        const response = await testRequest(
          { ...validDto, password: 'abcdefghijklmnopqrstuvwxyz' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'password',
            message: 'password must be shorter than or equal to 20 characters',
          },
        ]);
      });
    });

    describe('email', () => {
      it('should throw an error if email is empty', async () => {
        const response = await testRequest(
          { ...validDto, email: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'email',
            message:
              'email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression',
          },
        ]);
      });

      it('Should throw an error if email is not valid', async () => {
        const response = await testRequest(
          { ...validDto, email: 'test' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          {
            field: 'email',
            message:
              'email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression',
          },
        ]);
      });

      it('Should throw an error if email is not valid', async () => {
        const response = await testRequest({}, HttpStatus.BAD_REQUEST);

        checkFieldsInErrorMessage(response, [
          {
            field: 'login',
            message: 'login must be a string',
          },
          {
            field: 'password',
            message: 'password must be a string',
          },
          {
            field: 'email',
            message: 'email must be a string',
          },
        ]);
      });
    });
  });

  describe('Check business rule validation. Status: 400', () => {
    it('Should throw an error if "login" already in use', async () => {
      await given.newUserRegistration({ ...validDto });
      const response = await testRequest(
        { ...validDto, email: 'notBusyEmail@test.test' },
        HttpStatus.BAD_REQUEST,
      );

      checkFieldsInErrorMessage(response, [
        {
          field: 'login',
          message: `User with login: ${validDto.login} already exists`,
        },
      ]);
    });

    it('Should throw an error if "email" already in use', async () => {
      await given.newUserRegistration({ ...validDto });
      const response = await testRequest(
        { ...validDto, login: 'newLogin' },
        HttpStatus.BAD_REQUEST,
      );

      checkFieldsInErrorMessage(response, [
        {
          field: 'email',
          message: `User with email: ${validDto.email} already exists`,
        },
      ]);
    });
  });

  it('Input data is accepted. Email with confirmation code will be send to passed email address. Status 204', async () => {
    await testRequest(validDto, HttpStatus.NO_CONTENT);
  });

  it('Return error "Too many requests". Status 429', async () => {
    for (let i = 0; i < 5; i++) {
      await testRequest({}, HttpStatus.BAD_REQUEST);
    }
    await testRequest({}, HttpStatus.TOO_MANY_REQUESTS);
  });
});
