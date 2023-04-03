import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { ConfirmRegistrationCommand } from './registration-confirmation.use-case';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

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
     * Given: There is a user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when confirmationCode is expired`, async () => {
    const firstUser = await usersPgRepository.findByLogin('firstUser');
    await usersPgRepository.forTest_resetExpirationDateOfConfirmationCodeToCurrentDate(
      firstUser.id,
    );

    await expect(
      commandBus.execute(
        new ConfirmRegistrationCommand(firstUser.confirmationCode),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException('The confirmation code is expired'),
    );
  });

  it(`throw when confirmationCode is already confirmed`, async () => {
    const firstUser = await usersPgRepository.findByLogin('firstUser');

    await commandBus.execute(
      new ConfirmRegistrationCommand(firstUser.confirmationCode),
    );

    await expect(
      commandBus.execute(
        new ConfirmRegistrationCommand(firstUser.confirmationCode),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException('The email is already confirmed'),
    );
  });

  it(`Successfully confirm registration `, async () => {
    let firstUser = await usersPgRepository.findByLogin('firstUser');

    await commandBus.execute(
      new ConfirmRegistrationCommand(firstUser.confirmationCode),
    );

    firstUser = await usersPgRepository.findByLogin('firstUser');
    expect(firstUser.isConfirmed).toBe(true);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );
  }
});
