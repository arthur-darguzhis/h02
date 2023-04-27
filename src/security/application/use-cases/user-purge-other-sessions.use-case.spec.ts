import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import jwt from 'jsonwebtoken';
import { LoginCommand } from '../../../auth/application/use-cases/login.use-case';
import { UserPurgeOtherSessionsCommand } from './user-purge-other-sessions.use-case';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UserSessionsRepository } from '../../infrastructure/user-sessions.repository';

describe('User purge other sessions', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;
  let userSessionsPgRepository: UserSessionsRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);
    userSessionsPgRepository = given.configuredTestApp.get(
      userSessionsPgRepository,
    );

    /** Arrange
     * Given: There is a user with login "firstUser"
     * And: The user have 2 login sessions from different devices.
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`user purge other sessions`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    const { accessToken, refreshToken } = await commandBus.execute(
      new LoginCommand(user, '127.0.0.1', 'jest3'),
    );
    const decodedToken: any = jwt.decode(refreshToken, {
      json: true,
    });

    //Act
    await commandBus.execute(
      new UserPurgeOtherSessionsCommand(
        decodedToken.deviceId,
        decodedToken.userId,
      ),
    );

    //Assert
    const userSession = await userSessionsPgRepository.findAllSessionsByUser(
      decodedToken.userId,
    );
    expect(userSession.length).toBe(1);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    await commandBus.execute(new LoginCommand(user, '127.0.0.1', 'jest1'));
    await commandBus.execute(new LoginCommand(user, '127.0.0.1', 'jest2'));
    const userSession = await userSessionsPgRepository.findAllSessionsByUser(
      user.id,
    );
    expect(userSession.length).toBe(2);
  }
});
