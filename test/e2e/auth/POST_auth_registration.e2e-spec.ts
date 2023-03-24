import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import { Given } from '../../xxx/testEntities/Given';
import { checkFieldsInErrorMessage } from '../responseChecker';
import request, { Response } from 'supertest';

describe('POST /auth/registration (e2e)', () => {
  let configuredTestApp: INestApplication;
  let given: Given;

  const validDto = {
    login: 'user1',
    password: '123456',
    email: 'user1@test.test',
  };

  /**
   * Here we check registration process that End-point is working correct.
   * @param dto
   * @param status
   */
  const testRequest = async (dto, status: HttpStatus): Promise<Response> => {
    return request(configuredTestApp.getHttpServer())
      .post('/auth/registration')
      .send(dto)
      .expect(status);
  };

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();

    given = new Given(configuredTestApp.getHttpServer());
    await given.clearDb();
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  describe('Invalid input data in DTO. Status: 400.', () => {
    describe('login', () => {
      it('Should throw an error if login is empty', async () => {
        const response = await testRequest(
          { ...validDto, login: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });

      it('Should throw an error if login is less than 3 characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'aa' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });

      it('Should throw an error if login is more than 10 characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'abcdefghijklmnopqrstuvwxyz' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });

      it('Should throw an error if login contains invalid characters', async () => {
        const response = await testRequest(
          { ...validDto, login: 'user@name' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['login']);
      });
    });

    describe('password', () => {
      it('Should throw an error if password is empty', async () => {
        const response = await testRequest(
          { ...validDto, password: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['password']);
      });

      it('Should throw an error if password is less than 6 characters', async () => {
        const response = await testRequest(
          { ...validDto, password: '12345' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['password']);
      });

      it('Should throw an error if password is more than 20 characters', async () => {
        const response = await testRequest(
          { ...validDto, password: 'abcdefghijklmnopqrstuvwxyz' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['password']);
      });
    });

    describe('email', () => {
      it('should throw an error if email is empty', async () => {
        const response = await testRequest(
          { ...validDto, email: '' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['email']);
      });

      it('Should throw an error if email is not valid', async () => {
        const response = await testRequest(
          { ...validDto, email: 'test' },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['email']);
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

      checkFieldsInErrorMessage(response, ['login']);
    });

    it('Should throw an error if "email" already in use', async () => {
      await given.newUserRegistration({ ...validDto });
      const response = await testRequest(
        { ...validDto, login: 'newLogin' },
        HttpStatus.BAD_REQUEST,
      );

      checkFieldsInErrorMessage(response, ['email']);
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
