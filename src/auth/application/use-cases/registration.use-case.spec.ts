import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { EntityAlreadyExistsException } from '../../../common/exceptions/domain.exceptions/entity-already-exists.exception';

describe('User registration use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);

    /** Arrange
     * //TODO add here description of prepared environment
     * Given: There is a user as with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when login: "firstUser" is in use`, async () => {
    await expect(
      commandBus.execute(
        new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
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
        new RegistrationCommand('new_user', '123456', 'firstUser@test.test'),
      ),
    ).rejects.toThrow(
      new EntityAlreadyExistsException(
        'User with email: firstUser@test.test already exists',
      ),
    );
  });

  it(`Successfully register new user`, async () => {
    const user = await commandBus.execute(
      new RegistrationCommand('secondUser', '123456', 'secondUser@test.test'),
    );

    //Assert
    const firstUser = await usersPgRepository.findByLogin('secondUser');
    expect(firstUser).not.toEqual([]);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
