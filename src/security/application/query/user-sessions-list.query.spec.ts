import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { LoginCommand } from '../../../auth/application/use-cases/login.use-case';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UserSessionsPgRepository } from '../../infrastructure/user-sessions-pg.repository';
import { UserSessionsListQuery } from './user-sessions-list.query';

describe('User purge other sessions', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let usersPgRepository: UsersPgRepository;
  let userSessionsPgRepository: UserSessionsPgRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    userSessionsPgRepository = given.configuredTestApp.get(
      UserSessionsPgRepository,
    );

    /** Arrange
     * Given: There is a user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('user get paginated sessions list', async () => {
    //Arrange: both users are logged in
    const firstUser = await usersPgRepository.getByEmail('firstUser@test.test');

    await commandBus.execute(new LoginCommand(firstUser, '127.0.0.1', 'jest'));
    await commandBus.execute(new LoginCommand(firstUser, '127.0.0.1', 'jest2'));

    //Act
    const userSessions = await queryBus.execute(
      new UserSessionsListQuery(firstUser.id),
    );

    //Assert
    expect(userSessions.length).toBe(2);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
