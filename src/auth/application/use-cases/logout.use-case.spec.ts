import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { LoginCommand } from './login.use-case';
import jwt from 'jsonwebtoken';

describe('User logout use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersRepository);

    /** Arrange
     * Given: There is a user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Successfully logout`, async () => {
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    const { accessToken, refreshToken } = await commandBus.execute(
      new LoginCommand(user, '127.0.0.1', 'jest'),
    );

    //Assert
    jwt.verify(accessToken, process.env.JWT_SECRET);
    jwt.verify(refreshToken, process.env.JWT_SECRET);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
