import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { LoginCommand } from './login.use-case';
import { UserSessionsRepository } from '../../../security/infrastructure/user-sessions.repository';
import { LogoutCommand } from './logout.use-case';
import jwt from 'jsonwebtoken';

describe('User login use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersRepository: UsersRepository;
  let userSessionsRepository: UserSessionsRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersRepository = given.configuredTestApp.get(UsersRepository);
    userSessionsRepository = given.configuredTestApp.get(
      UserSessionsRepository,
    );

    /** Arrange
     * Given: There is a user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Successfully register new user`, async () => {
    //Arrange
    const user = await usersRepository.getByEmail('firstUser@test.test');
    const { accessToken, refreshToken } = await commandBus.execute(
      new LoginCommand(user, '127.0.0.1', 'jest'),
    );
    const decodedToken: any = jwt.decode(refreshToken, {
      json: true,
    });

    //Act
    await commandBus.execute(
      new LogoutCommand(decodedToken.deviceId, decodedToken.userId),
    );

    //Assert
    const userSession = await userSessionsRepository.findByDeviceId(
      decodedToken.deviceId,
    );
    expect(userSession).toBeNull();
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
