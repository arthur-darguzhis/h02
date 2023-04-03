import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { LoginCommand } from './login.use-case';
import jwt from 'jsonwebtoken';
import { RefreshTokenCommand } from './refresh-token.use-case';
import { wait } from '../../../testing/wait';

describe('Refresh token use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
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
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    const tokensPair = await commandBus.execute(
      new LoginCommand(user, '127.0.0.1', 'jest'),
    );

    const decodedToken: any = jwt.decode(tokensPair.refreshToken, {
      json: true,
    });

    await wait(2000);

    const newTokensPair = await commandBus.execute(
      new RefreshTokenCommand(decodedToken, '127.0.0.1', 'jest'),
    );

    //Assert
    jwt.verify(newTokensPair.accessToken, process.env.JWT_SECRET);
    jwt.verify(newTokensPair.refreshToken, process.env.JWT_SECRET);
    expect(tokensPair.accessToken).not.toBe(newTokensPair.accessToken);
    expect(tokensPair.refreshToken).not.toBe(newTokensPair.refreshToken);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
