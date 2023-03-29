import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { superAdminLogin, superAdminPassword } from '../testVariables';
import { TestUser } from './TestUser';
import { Error } from 'mongoose';
import { setConfigTestApp } from '../../e2e/appConfigurations';

export class Given {
  private constructor(
    public configuredTestApp: INestApplication,
    public app: HttpServer,
  ) {}

  static async bootstrapTestApp() {
    const configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    const app = configuredTestApp.getHttpServer();
    return new Given(configuredTestApp, app);
  }

  public async closeApp() {
    await this.configuredTestApp.close();
  }

  public async clearDb() {
    await request(this.app).delete('/testing/all-data');
  }

  public async adminAddUserToSystem(login: string): Promise<Response> {
    const response = await request(this.app)
      .post('/users')
      .auth(superAdminLogin, superAdminPassword, { type: 'basic' })
      .send({
        login: login,
        password: '123456',
        email: `${login}-test@test.test`,
      })
      .expect(HttpStatus.CREATED);

    //TODO нужно ли где то отдельно держать генератор DTO? или лучше как сейчас использовать? и каждый раз генерация на чем то должна быть основанна.
    TestUser.storage.set(
      login,
      new TestUser(this.app, response.body.id, login),
    );
    return response;
  }

  //TODO попробовать вынести какой то интерфейс.

  public async newUserRegistration(
    dto: object,
    testUserStorageKey?: string,
  ): Promise<TestUser> {
    const response = await request(this.app)
      .post('/auth/registration')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);

    if (TestUser.storage.has(testUserStorageKey)) {
      throw new Error(
        `TestUser.storage already has value associated with key "${testUserStorageKey}"`,
      );
    }

    const testUser = new TestUser(this.app, response.body.id);
    if (testUserStorageKey) {
      TestUser.storage.set(testUserStorageKey, testUser);
    }
    return testUser;
  }
}
