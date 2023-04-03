import { Given } from '../../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../../users/infrastructure/users.pg-repository';
import { EntityAlreadyExistsException } from '../../../../common/exceptions/domain.exceptions/entity-already-exists.exception';
import { AdminAddNewUserCommand } from './admin-add-new-user.use-case';

describe('Admin add new user use-case', () => {
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

  it(`throw when login: "firstUser" is in use`, async () => {
    await expect(
      commandBus.execute(
        new AdminAddNewUserCommand(
          'firstUser',
          '123456',
          'firstUser@test.test',
        ),
      ),
    ).rejects.toThrow(
      new EntityAlreadyExistsException(
        'User with login: firstUser already exists',
      ),
    );
  });

  it(`throw when email: "firstUser@test.test" is in use`, async () => {
    await expect(
      commandBus.execute(
        new AdminAddNewUserCommand('new_user', '123456', 'firstUser@test.test'),
      ),
    ).rejects.toThrow(
      new EntityAlreadyExistsException(
        'User with email: firstUser@test.test already exists',
      ),
    );
  });

  it(`Successfully register new user`, async () => {
    await commandBus.execute(
      new AdminAddNewUserCommand(
        'secondUser',
        '123456',
        'secondUser@test.test',
      ),
    );

    //Assert
    const firstUser = await usersPgRepository.findByLogin('secondUser');
    expect(firstUser).not.toEqual([]);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
