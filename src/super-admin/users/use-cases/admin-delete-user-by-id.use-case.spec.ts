import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { AdminAddNewUserCommand } from './admin-add-new-user.use-case';
import { AdminDeleteUserByIdCommand } from './admin-delete-user-by-id.use-case';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

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

  it(`throw when admin delete a user that is not exists`, async () => {
    //Act && Assert
    await expect(
      commandBus.execute(
        new AdminDeleteUserByIdCommand('ca3c3e56-eef1-4fe5-9abf-f96d8ca302fa'),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `User with id: ca3c3e56-eef1-4fe5-9abf-f96d8ca302fa is not exists`,
        'login',
      ),
    );
  });

  it(`Admin successfully delete user`, async () => {
    //Arrange
    const firstUser = await usersPgRepository.findByLogin('firstUser');

    //Act
    await commandBus.execute(new AdminDeleteUserByIdCommand(firstUser.id));

    //Assert
    const userShouldBeDeleted = await usersPgRepository.findByLogin(
      'firstUser',
    );
    expect(userShouldBeDeleted).toBeNull();
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});