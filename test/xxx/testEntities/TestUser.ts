import request from 'supertest';
import { superAdminLogin, superAdminPassword } from '../testVariables';
import { HttpServer, HttpStatus } from '@nestjs/common';
import { TestBlog } from './TestBlog';

export class TestUser {
  static storage: Map<string, TestUser> = new Map();

  private accessToken: string;
  private cookieWithRefreshToken: string;

  constructor(
    private app: HttpServer,
    public id: string,
    public login: string = '', //TODO попробовать избавится от этого поля.
  ) {}

  public async authLogin() {
    const response = await request(this.app)
      .post('/users')
      .auth(superAdminLogin, superAdminPassword, { type: 'basic' })
      .send({
        loginOrEmail: this.login,
        password: '123456',
      })
      .expect(HttpStatus.OK);

    this.accessToken = response.body.accessToken;
    this.cookieWithRefreshToken = response.header['set-cookie'];
  }

  public async createNewBlog(blogName: string, status = HttpStatus.CREATED) {
    const response = await request(this.app)
      .post('/blogger/blogs')
      .auth(this.accessToken, { type: 'bearer' })
      .send({
        name: blogName,
        description: 'first blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      })
      .expect(status);

    return new TestBlog(this.app, response.body.id, blogName);
  }
}
