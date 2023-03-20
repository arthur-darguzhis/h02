import { CreateUserDto } from '../../src/users/api/dto/createUser.dto';
import request, { Response } from 'supertest';
import { LoginDto } from '../../src/auth/dto/login.dto';

/**
 * RequestMaker is an object that collects arrow functions to make HTTP requests, such as "create user" or "create blog".
 *
 * The purpose of these functions is to prepare the background for other tests.
 * For example, to test the "/logout" endpoint, we need to "create a user" and then "login the user".
 *
 * All arrow functions should have readable and meaningful names, grouped by endpoints, such as "users" or "blogs".
 * For Instance.
 * users: {
 *   createUser: () => {}
 *   deleteUser: () => {}
 * }
 * In result we have a map of actions based on swagger documentation
 **/

export const RequestsMaker = {
  testing: {
    clearDb: async (app) => {
      await request(app).delete('/testing/all-data');
    },
  },
  users: {
    createUser: async (app, dto: CreateUserDto) => {
      const newUser = await request(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(dto);

      return newUser.body.id;
    },

    login: async (
      app,
      dto: LoginDto,
    ): Promise<{
      accessToken: string;
      cookie: string;
    }> => {
      const response: Response = await request(app)
        .post('/auth/login')
        .send(dto);

      const accessToken = response.body.accessToken;
      const cookie = response.header['set-cookie'];
      return {
        accessToken,
        cookie,
      };
    },

    refreshToken: async (
      app,
      cookie: string,
    ): Promise<{
      accessToken: string;
      cookie: string;
    }> => {
      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [...cookie])
        .send();

      const accessToken = response.body.accessToken;
      const newCookie = response.header['set-cookie'];
      return {
        accessToken,
        cookie: newCookie,
      };
    },

    logout: async (app, cookie: string) => {
      await request(app)
        .post('/auth/logout')
        .set('Cookie', [...cookie])
        .send();
    },
  },
  blogger: {
    createNewBlog: async (
      app,
      accessToken,
      dto,
      status,
    ): Promise<request.Response> => {
      return request(app)
        .post('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);
    },
  },
};
