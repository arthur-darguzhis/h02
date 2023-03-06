import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { CreateUserDto } from '../../../src/users/dto/createUser.dto';

describe('POST /users (e2e)', () => {
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

  describe('Should create new user. Status 201', () => {
    it('make POST request with valid DTO to /users', async () => {
      const dto: CreateUserDto = {
        login: 'user1',
        password: '123456',
        email: 'user1-test@test.test',
      };

      const newUser = await request(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(dto)
        .expect(HttpStatus.CREATED);

      expect(newUser.body).toEqual({
        id: expect.any(String),
        login: 'user1',
        email: 'user1-test@test.test',
        createdAt: expect.any(String),
      });
    });
  });
});
