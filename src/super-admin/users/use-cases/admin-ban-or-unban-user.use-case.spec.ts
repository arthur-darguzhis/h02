import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { EntityAlreadyExistsException } from '../../../common/exceptions/domain.exceptions/entity-already-exists.exception';
import { AdminAddNewUserCommand } from './admin-add-new-user.use-case';
import { AdminBanOrUnbanUserCommand } from './admin-ban-or-unban-user.use-case';
import { LoginCommand } from '../../../auth/application/use-cases/login.use-case';
import { UserSessionsPgRepository } from '../../../security/user-sessions-pg.repository';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

describe('Admin add new user use-case', () => {
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
     * with login "firstUser",
     * with login "bannedUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when admin ban user and user is already banned`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('bannedUser@test.test');

    //Act & Assert
    await expect(
      commandBus.execute(
        new AdminBanOrUnbanUserCommand(user.id, true, 'abuse behaviour'),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException('The user is already banned'),
    );
  });

  it(`throw when admin ban user and user is already unbanned`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('firstUser@test.test');

    //Act & Assert
    await expect(
      commandBus.execute(new AdminBanOrUnbanUserCommand(user.id, false, '')),
    ).rejects.toThrow(
      new UnprocessableEntityException('The user is already active'),
    );
  });

  it(`Successfully ban user`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    await commandBus.execute(new LoginCommand(user, '127.0.0.1', 'jest'));

    //Act
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(user.id, true, 'abuse behaviour'),
    );

    //Assert
    const updatedUser = await usersPgRepository.getByEmail(
      'firstUser@test.test',
    );
    expect(updatedUser.banDate).not.toBeNull();
    expect(updatedUser.isBanned).toBe(true);
    expect(updatedUser.banReason).toBe('abuse behaviour');

    const userSessions = await userSessionsPgRepository.forTest_findByUserId(
      user.id,
    );
    expect(userSessions).toEqual([]);
  });

  it(`Successfully unban user`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('bannedUser@test.test');

    //Act
    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(user.id, false, ''),
    );

    //Assert
    const updatedUser = await usersPgRepository.getByEmail(
      'bannedUser@test.test',
    );

    expect(updatedUser.isBanned).toBe(false);
    expect(updatedUser.banReason).toBeNull();
    expect(updatedUser.banDate).toBeNull();
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand(
        'bannedUser',
        '123456',
        'bannedUser@test.test',
      ),
    );
    const bannedUser = await usersPgRepository.getByEmail(
      'bannedUser@test.test',
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(bannedUser.id, true, 'abuse behaviour'),
    );
  }
});
