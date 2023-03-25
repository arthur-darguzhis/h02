import { HttpServer, HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigTestApp } from '../appConfigurations';
import request from 'supertest';
import { RequestsMaker } from '../requestsMaker';
import { checkFieldsInErrorMessage } from '../responseChecker';
import { Given } from '../../xxx/testEntities/Given';

describe(`PUT  (e2e)`, () => {
  let configuredTestApp: INestApplication;
  let app: HttpServer;

  beforeEach(async () => {
    configuredTestApp = await setConfigTestApp();
    await configuredTestApp.init();
    app = configuredTestApp.getHttpServer();

    const given = new Given(app);
    await given.clearDb();

    const user1 = await given.adminAddUserToSystem('user1');
    await user1.authLogin();

    const user1Blog = await user1.createNewBlog('user1_blog');

    user1.addNewPostToBlog('user1_blog_post', 'user1_blog');
    // user1.addNewCommentToPost('user1_blog_post');
    // user1.addSetLikeToPost('user1_blog_post');
    // user1.addSetLikeToComment('user1_blog_post');
    //TODO стоит ли хранить каждого пользователя в отдельной переменной или лучше создать некую коллекцию куда всех комещать?

    //Создали пользователя с логином user1 (дальше тело dto сам должно заполниться по аналогии.)
    //user.login();
    //user.createBlog('blog1');
    //user.addPostToBlog('post1');

    //Создали пользователя с логином user2 (дальше тело dto сам должно заполниться по аналогии.)
    //а это уже главный тест кейс user1.blog.banUserById()

    //А дальше проверяем что пользователь не может оставлять комментарии к этому посту.
  });

  afterEach(async () => {
    await configuredTestApp.close();
  });

  // it.todo('');
  // //TODO 4. START: case(s) of unauthorized. Status code 401. (after making this step replace "TODO" to "STEP")
  it('Should return error if auth credentials are incorrect. Status 401', async () => {
    await request(app).put('/').send().expect(HttpStatus.UNAUTHORIZED);
  });
  //STEP 4. END

  // //TODO 5. START: case(s) incoming DTO data is invalid. Status 400 (after making this step replace "TODO" to "STEP")
  // describe('Invalid input data in DTO. Status: 400.', () => {
  //   const dto = {
  //     //TODO define fields that have to be validated with corrected data
  //   };
  //
  //   //TODO change "fieldName" to field name that has some validation rules
  //   describe('fieldName', () => {
  //     //TODO Press "CMD + J" and type "checkValidation" choose necessary rules for checking validation
  //   });
  //
  //   describe('All fields are empty', () => {
  //     it('should throw an error with "number" of errors', async () => {
  //       const response = await sendTestRequest(
  //         tokensUser1.accessToken,
  //         {
  //           //TODO put here dto structure with empty fields ''
  //         },
  //         blogIdOfUser1,
  //         HttpStatus.BAD_REQUEST,
  //       );
  //
  //       checkFieldsInErrorMessage(response, [
  //         //TODO put here all field names
  //       ]);
  //     });
  //   });
  // });
  //STEP 5. END
  //
  // //TODO 6. START: case(s) if user try to update that does not belong to him.
  // it('Should return error if user try to update a "Entity" that is not it`s own', async () => {
  //   const response = await sendTestRequest(
  //     tokensUser1.accessToken,
  //     {
  //       name: 'updated name',
  //       description: 'updated first blog description',
  //       websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
  //     },
  //     blogIdOfUser2,
  //     HttpStatus.FORBIDDEN,
  //   );
  // });
  // //STEP 6. END
  //
  // //TODO 7. START: case(s) of success Status code 200, 201, 204. (after making this step replace "TODO" to "STEP")
  // //TODO 9. change description of this test (remove this TODO after implementation)
  // it('Should "****". Status 201', async () => {
  //   const dto = {
  //     //TODO 10 here put a DTO structure with valid values
  //   };
  //
  //   const response = await sendTestRequest(
  //     tokensUser1.accessToken,
  //     {
  //       name: 'updated name',
  //       description: 'updated first blog description',
  //       websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
  //     },
  //     blogIdOfUser1,
  //     HttpStatus.NO_CONTENT,
  //   );
  // });
});
