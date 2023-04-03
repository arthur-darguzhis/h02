import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/users.pg-repository';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler {
  constructor(private usersPgRepository: UsersPgRepository) {}
  async execute(command: ConfirmRegistrationCommand) {
    const user = await this.usersPgRepository.getByConfirmationCode(
      command.code,
    );

    if (user.isConfirmed) {
      throw new UnprocessableEntityException('The email is already confirmed');
    }

    if (user.expirationDate < new Date().getTime()) {
      throw new UnprocessableEntityException(
        'The confirmation code is expired',
      );
    }

    await this.usersPgRepository.confirmEmailAndActivateAccount(user.id);
  }
}
