import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setConfigTestApp } from '../appConfigurations';

describe('POST /auth/registration (e2e)', () => {
  let configuredTestApp: INestApplication;
  let app: any;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();
    await request(app).delete('/testing/all-data');
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  describe('Invalid input data in DTO. Status: 400.', () => {
    describe('login', () => {
      it('should throw an error if login is empty', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: '',
            password: '123456',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if login is less than 3 characters', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'aa',
            password: '123456',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if login is more than 10 characters', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'abcdefghijklmnopqrstuvwxyz',
            password: '123456',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if login contains invalid characters', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'user@name',
            password: '123456',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });
    });

    describe('password', () => {
      it('should throw an error if password is empty', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'username',
            password: '',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if password is less than 6 characters', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'username',
            password: '12345',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if password is more than 20 characters', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'username',
            password: 'abcdefghijklmnopqrstuvwxyz',
            email: 'test@example.com',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });
    });

    describe('email', () => {
      it('should throw an error if email is empty', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'username',
            password: '123456',
            email: '',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });

      it('should throw an error if email is not valid', async () => {
        const response = await request(app)
          .post('/auth/registration')
          .send({
            login: 'username',
            password: '123456',
            email: 'test',
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body).toEqual({
          errorsMessages: expect.any(Array),
        });
      });
    });
  });
});
