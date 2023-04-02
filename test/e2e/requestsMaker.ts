import { CreateUserDto } from '../../src/users/api/dto/createUser.dto';
import request, { Response } from 'supertest';
import { LoginDto } from '../../src/auth/api/dto/login.dto';
import { HttpStatus } from '@nestjs/common';
import { PostReaction } from '../../src/posts/post-reaction-schema';

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

export const ID_FOR_NOT_FOUND = '6419e881e3b73481c6270b0a';

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
        .send(dto)
        .expect(HttpStatus.CREATED);

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
        .send(dto)
        .expect(HttpStatus.OK);

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
  blogs: {
    adminCreateNewBlog: async (app, dto): Promise<string> => {
      const createBlogResponse = await request(app)
        .post('/blogs')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(dto)
        .expect(HttpStatus.CREATED);

      return createBlogResponse.body.id;
    },
  },
  blogger: {
    createNewBlog: async (app, accessToken, dto, status): Promise<string> => {
      const newBlog = await request(app)
        .post('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);

      return newBlog.body.id;
    },
    createNewPost: async (
      app: any,
      accessToken,
      blogId,
      dto,
      status,
    ): Promise<string> => {
      const newPost = await request(app)
        .post(`/blogger/blogs/${blogId}/posts`)
        .auth(accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);
      return newPost.body.id;
    },
  },
  superAdminCreateNewUser: async (
    app,
    dto = {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    },
  ) => {
    const response = await request(app)
      .post('/sa/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(dto)
      .expect(HttpStatus.CREATED);
    return response.body.id;
  },

  userAddCommentToPost: async (
    app,
    accessToken,
    postId,
    dto = {
      content: 'this is a sample of a correct comment that can be saved',
    },
  ) => {
    const response = await request(app)
      .post(`/posts/${postId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .send(dto)
      .expect(HttpStatus.CREATED);

    return response.body.id;
  },

  userLikeComment: async (app, accessToken, commentId) => {
    const response = await request(app)
      .put(`/comments/${commentId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: PostReaction.LIKE_STATUS_OPTIONS.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);
    return response.body.id;
  },
  userLikePost: async (app, accessToken, postId) => {
    const response = await request(app)
      .put(`/posts/${postId}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        likeStatus: PostReaction.LIKE_STATUS_OPTIONS.LIKE,
      })
      .expect(HttpStatus.NO_CONTENT);

    return response.body.id;
  },
};
