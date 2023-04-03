import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { PasswordRecoveryRepository } from '../../../users/password-recovery.repository';
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
    private usersPgRepository: UsersPgRepository,
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
