import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery.repository';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import * as bcrypt from 'bcrypt';

export class SetNewPasswordCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase implements ICommandHandler {
  constructor(
    private usersPgRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}
  async execute(command: SetNewPasswordCommand) {
    console.log(command);
    const passwordRecovery = await this.passwordRecoveryRepository.getByCode(
      command.recoveryCode,
    );

    if (passwordRecovery.expirationDate < new Date()) {
      throw new UnprocessableEntityException(
        'The password recovery code is expired',
      );
    }

    await this.usersPgRepository.setNewPassword(
      await this.generatePasswordHash(command.newPassword),
      passwordRecovery.userId,
    );

    await this.passwordRecoveryRepository.confirmPasswordRecovery(
      passwordRecovery.code,
    );
  }

  private async generatePasswordHash(password) {
    return await bcrypt.hash(password, 10);
  }
}
