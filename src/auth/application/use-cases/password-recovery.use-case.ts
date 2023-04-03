import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery.repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { EmailSenderService } from '../../../global-services/email-sender.service';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler {
  constructor(
    private usersPgRepository: UsersPgRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: PasswordRecoveryCommand) {
    console.log(command);
    const user = await this.usersPgRepository.getByEmail(command.email);
    const code = uuidv4();
    await this.passwordRecoveryRepository.savePasswordRecoveryMetadata(
      code,
      new Date(),
      add(Date.now(), { hours: 24 }),
      false,
      user.id,
    );
    await this.emailSenderService.sendPasswordRecoveryEmail(user.email, code);
  }
}
