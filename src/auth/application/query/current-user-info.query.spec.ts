import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { CurrentUserInfoQuery } from './current-user-info.query';

describe('Should return info about me (current user info)', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let usersPgRepository: UsersPgRepository;

  let firstUser;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);

    /** Arrange
     * Given: There is a user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Successfully register new user`, async () => {
    //Act
    const result = await queryBus.execute(
      new CurrentUserInfoQuery(firstUser.id),
    );

    //Assert
    expect(result).toEqual({
      userId: firstUser.id,
      login: 'firstUser',
      email: 'firstUser@test.test',
    });
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    firstUser = await usersPgRepository.getByEmail('firstUser@test.test');
  }
});
