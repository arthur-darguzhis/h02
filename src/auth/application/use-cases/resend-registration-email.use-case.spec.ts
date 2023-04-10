import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './registration.use-case';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { ConfirmRegistrationCommand } from './registration-confirmation.use-case';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { ResendRegistrationEmailCommand } from './resend-registration-email.use-case';

describe('User resend registration email use-case', () => {
  let given: Given;
  let commandBus: CommandBus;
  let usersPgRepository: UsersPgRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);

    /** Arrange
     * Given: There are 3 users with logins:
     * "valid" - This user has "expiration date" > "current date",
     * "invalid" - This user has "expiration date" < "current date" invalid condition for resending registration email.
     * "confirmed" - This user has been confirmed and the use case should throw exception on this user.
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`throw when try to resend confirmation email on email that is not in system`, async () => {
    await expect(
      commandBus.execute(
        new ResendRegistrationEmailCommand('emailIsNotInTheSystem@test.test'),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException(
        `User with email: emailIsNotInTheSystem@test.test is not found`,
      ),
    );
  });

  it(`throw when try to resend registration email to confirmed user`, async () => {
    const confirmedUser = await usersPgRepository.findByLogin('confirmed');

    await expect(
      commandBus.execute(
        new ResendRegistrationEmailCommand(confirmedUser.email),
      ),
    ).rejects.toThrow(
      new UnprocessableEntityException(
        'The email is already confirmed',
        'email',
      ),
    );
  });

  it(`Successfully resend registration email`, async () => {
    const validUser = await usersPgRepository.findByLogin('valid');

    await commandBus.execute(
      new ResendRegistrationEmailCommand(validUser.email),
    );

    const validUserWithUpdatedConfirmationCodeInfo =
      await usersPgRepository.findByLogin('valid');

    expect(validUserWithUpdatedConfirmationCodeInfo.confirmationCode).not.toBe(
      validUser.confirmationCode,
    );
  });

  async function prepareData(): Promise<void> {
    await commandBus.execute(
      new RegistrationCommand('valid', '123456', 'valid@test.test'),
    );

    await commandBus.execute(
      new RegistrationCommand('invalid', '123456', 'invalid@test.test'),
    );

    const invalidUser = await usersPgRepository.getByEmail('invalid@test.test');
    await usersPgRepository.forTest_resetExpirationDateOfConfirmationCodeToCurrentDate(
      invalidUser.id,
    );

    await commandBus.execute(
      new RegistrationCommand('confirmed', '123456', 'confirmed@test.test'),
    );
    const confirmedUser = await usersPgRepository.getByEmail(
      'confirmed@test.test',
    );

    await commandBus.execute(
      new ConfirmRegistrationCommand(confirmedUser.confirmationCode),
    );
  }
});
