import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { ID_FOR_NOT_FOUND, RequestsMaker } from '../requestsMaker';
import { faker } from '@faker-js/faker';
import { checkFieldsInErrorMessage } from '../responseChecker';

describe(`PUT /blogger/blogs/:blogId/posts (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: any;

  let tokensUser1: any;
  let tokensUser2: any;
  let blogIdOfUser1: string;
  let blogIdOfUser2: string;
  let postIdOfUser1: string;
  let postIdOfUser2: string;

  const dtoWithValidData = {
    title: 'updated title',
    shortDescription: 'updated shortDescription',
    content: 'updated content',
  };

  let sendTestRequest: (
    dto: any,
    status: (typeof HttpStatus)[keyof typeof HttpStatus],
  ) => Promise<request.Response>;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    await request(app).delete('/testing/all-data');

    await RequestsMaker.users.createUser(app, {
      login: 'user1',
      password: '123456',
      email: 'user1-test@test.test',
    });

    tokensUser1 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user1',
      password: '123456',
    });

    blogIdOfUser1 = await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser1.accessToken,
      {
        name: 'second blog',
        description: 'the second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );

    postIdOfUser1 = await RequestsMaker.blogger.createNewPost(
      app,
      tokensUser1.accessToken,
      blogIdOfUser1,
      {
        title: 'Управление состоянием в React',
        shortDescription: 'Все мы прекрасно знаем что построит...',
        content: 'Буквально каждую конференцию мы слышим от !',
      },
      HttpStatus.CREATED,
    );

    await RequestsMaker.users.createUser(app, {
      login: 'user2',
      password: '123456',
      email: 'user2-test@test.test',
    });

    tokensUser2 = await RequestsMaker.users.login(app, {
      loginOrEmail: 'user2',
      password: '123456',
    });

    blogIdOfUser2 = await RequestsMaker.blogger.createNewBlog(
      app,
      tokensUser2.accessToken,
      {
        name: 'second blog',
        description: 'the second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
      },
      HttpStatus.CREATED,
    );

    postIdOfUser2 = await RequestsMaker.blogger.createNewPost(
      app,
      tokensUser2.accessToken,
      blogIdOfUser2,
      {
        title: 'Управление состоянием в React',
        shortDescription: 'Все мы прекрасно знаем что построит...',
        content: 'Буквально каждую конференцию мы слышим от !',
      },
      HttpStatus.CREATED,
    );

    sendTestRequest = async (dto, status): Promise<request.Response> => {
      return request(app)
        .put(`/blogger/blogs/${blogIdOfUser1}/posts/${postIdOfUser1}`)
        .auth(tokensUser1.accessToken, { type: 'bearer' })
        .send(dto)
        .expect(status);
    };
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app)
      .put(`/blogger/blogs/${blogIdOfUser1}/posts/${postIdOfUser1}`)
      .send()
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should return error if post with postId does not exist. Status 404', async () => {
    await request(app)
      .put(`/blogger/blogs/${blogIdOfUser1}/posts/${ID_FOR_NOT_FOUND}`)
      .auth(tokensUser1.accessToken, { type: 'bearer' })
      .send(dtoWithValidData)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Should return error if blogger try to update post that does not belong to him. Status 403', async () => {
    await request(app)
      .put(`/blogger/blogs/${blogIdOfUser2}/posts/${postIdOfUser1}`)
      .auth(tokensUser2.accessToken, { type: 'bearer' })
      .send(dtoWithValidData)
      .expect(HttpStatus.FORBIDDEN);
  });

  describe('Invalid input data in DTO. Status: 400.', () => {
    describe('title', () => {
      it(`should throw an error if "title" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          { ...dtoWithValidData, title: faker.datatype.string(1 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['title']);
      });

      it('should throw an error if "title" is more than 30 characters', async () => {
        const response = await sendTestRequest(
          { ...dtoWithValidData, title: faker.datatype.string(30 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['title']);
      });
    });

    describe('shortDescription', () => {
      it(`should throw an error if "shortDescription" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          {
            ...dtoWithValidData,
            shortDescription: faker.datatype.string(1 - 1),
          },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['shortDescription']);
      });

      it('should throw an error if "shortDescription" is more than 100 characters', async () => {
        const response = await sendTestRequest(
          {
            ...dtoWithValidData,
            shortDescription: faker.datatype.string(100 + 1),
          },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['shortDescription']);
      });
    });

    describe('content', () => {
      it(`should throw an error if "content" is less than 1 characters`, async () => {
        const response = await sendTestRequest(
          { ...dtoWithValidData, content: faker.datatype.string(1 - 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['content']);
      });

      it('should throw an error if "content" is more than 1000 characters', async () => {
        const response = await sendTestRequest(
          { ...dtoWithValidData, content: faker.datatype.string(1000 + 1) },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, ['content']);
      });
    });

    describe('All fields are empty', () => {
      it('should throw an error with "number" of errors', async () => {
        const response = await sendTestRequest(
          {
            title: '',
            shortDescription: '',
            content: '',
          },
          HttpStatus.BAD_REQUEST,
        );

        checkFieldsInErrorMessage(response, [
          'title',
          'shortDescription',
          'content',
        ]);
      });
    });
  });

  it('Should "update post". Status 204', async () => {
    await sendTestRequest(dtoWithValidData, HttpStatus.NO_CONTENT);
  });
});
