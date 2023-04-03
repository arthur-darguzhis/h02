import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { ConfirmRegistrationCommand } from './registration-confirmation.use-case';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { PasswordRecoveryCommand } from './password-recovery.use-case';
import { SetNewPasswordCommand } from './set-new-password.use-case';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery.repository';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { wait } from '../../../testing/wait';

describe('set new password use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;
  let passwordRecoveryRepository: PasswordRecoveryRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);
    passwordRecoveryRepository = given.configuredTestApp.get(
      PasswordRecoveryRepository,
    );

    /** Arrange
     * Given: There is a confirmed user with login "firstUser"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when there is not recovery code in db`, async () => {
    await expect(
      commandBus.execute(
        new SetNewPasswordCommand(
          '654321',
          'test_code_that_is_not_exists_in_the_database',
        ),
      ),
    ).rejects.toThrow(new EntityNotFoundException('invalid password recovery'));
  });

  it(`throw when password recovery code is expired is not recovery code in db`, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    await commandBus.execute(
      new PasswordRecoveryCommand('firstUser@test.test'),
    );
    const passwordRecovery =
      await passwordRecoveryRepository.forTests_getByUserId(user.id);

    await passwordRecoveryRepository.forTest_resetExpirationDate(
      passwordRecovery.id,
    );

    await wait(2000);

    //Act & Assert
    await expect(
      commandBus.execute(
        new SetNewPasswordCommand('654321', passwordRecovery.code),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException('The password recovery code is expired'),
    );
  });

  it(`Successfully confirm registration `, async () => {
    //Arrange
    const user = await usersPgRepository.getByEmail('firstUser@test.test');
    await commandBus.execute(
      new PasswordRecoveryCommand('firstUser@test.test'),
    );
    const passwordRecovery =
      await passwordRecoveryRepository.forTests_getByUserId(user.id);

    //Act
    await commandBus.execute(
      new SetNewPasswordCommand('654321', passwordRecovery.code),
    );

    //Assert
    const updatedUser = await usersPgRepository.getByEmail(
      'firstUser@test.test',
    );

    const passwordRecoveryAfterSetNewPassword =
      await passwordRecoveryRepository.getByCode(passwordRecovery.code);

    expect(user.passwordHash).not.toBe(updatedUser.passwordHash);
    expect(passwordRecoveryAfterSetNewPassword.isConfirmed).toBe(true);
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    const firstUser = await usersPgRepository.findByLogin('firstUser');

    await commandBus.execute(
      new ConfirmRegistrationCommand(firstUser.confirmationCode),
    );
  }
});
