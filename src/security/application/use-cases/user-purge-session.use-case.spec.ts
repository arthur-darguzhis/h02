import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import jwt from 'jsonwebtoken';
import { LoginCommand } from '../../../auth/application/use-cases/login.use-case';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UserSessionsPgRepository } from '../../infrastructure/user-sessions-pg.repository';
import { UserPurgeSessionCommand } from './user-purge-session.use-case';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

describe('User purge other sessions', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;
  let userSessionsPgRepository: UserSessionsPgRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    userSessionsPgRepository = given.configuredTestApp.get(
      UserSessionsPgRepository,
    );

    /** Arrange
     * Given: There are two users:
     * with login "firstUser"
     * with login "secondUser
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('user can not purge session of other user', async () => {
    //Arrange: both users are logged in
    const firstUser = await usersPgRepository.getByEmail('firstUser@test.test');
    const secondUser = await usersPgRepository.getByEmail(
      'secondUser@test.test',
    );
    const firstUserTokens = await commandBus.execute(
      new LoginCommand(firstUser, '127.0.0.1', 'jest'),
    );
    const secondUserTokens = await commandBus.execute(
      new LoginCommand(secondUser, '127.0.0.1', 'jest'),
    );

    const firstUserDecodedToken: any = jwt.decode(
      firstUserTokens.refreshToken,
      {
        json: true,
      },
    );

    const secondUserDecodedToken: any = jwt.decode(
      secondUserTokens.refreshToken,
      {
        json: true,
      },
    );

    //Act & Assert
    await expect(
      commandBus.execute(
        new UserPurgeSessionCommand(
          secondUserDecodedToken.deviceId,
          firstUserDecodedToken.userId,
        ),
      ),
    ).rejects.toThrow(
      new UnauthorizedActionException('Unable to delete session'),
    );
  });

  it(`user purge session`, async () => {
    //Arrange: both users are logged in
    const firstUser = await usersPgRepository.getByEmail('firstUser@test.test');
    const secondUser = await usersPgRepository.getByEmail(
      'secondUser@test.test',
    );

    const firstUserTokens = await commandBus.execute(
      new LoginCommand(firstUser, '127.0.0.1', 'jest'),
    );

    await commandBus.execute(new LoginCommand(secondUser, '127.0.0.1', 'jest'));

    const firstUserDecodedToken: any = jwt.decode(
      firstUserTokens.refreshToken,
      {
        json: true,
      },
    );

    //Act & Assert
    await commandBus.execute(
      new UserPurgeSessionCommand(
        firstUserDecodedToken.deviceId,
        firstUserDecodedToken.userId,
      ),
    );

    const userSession = await userSessionsPgRepository.findAllSessionsByUser(
      firstUserDecodedToken.userId,
    );
    expect(userSession.length).toBe(0);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'secondUser',
        '123456',
        'secondUser@test.test',
      ),
    );
  }
});
