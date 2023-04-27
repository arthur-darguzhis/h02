import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PasswordRecoveryRepository } from '../../../users/infrastructure/password-recovery.repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { EmailSenderService } from '../../../global-services/email-sender.service';
import { PasswordRecovery } from '../../../users/application/entities/password-recovery';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler {
  constructor(
    private usersPgRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: PasswordRecoveryCommand) {
    console.log(command);
    const user = await this.usersPgRepository.getByEmail(command.email);
    const code = uuidv4();

    const passwordRecovery = new PasswordRecovery();
    passwordRecovery.code = code;
    passwordRecovery.sendingTime = new Date();
    passwordRecovery.expirationDate = add(Date.now(), { hours: 24 });
    passwordRecovery.isConfirmed = false;
    passwordRecovery.userId = user.id;

    await this.passwordRecoveryRepository.save(passwordRecovery);
    await this.emailSenderService.sendPasswordRecoveryEmail(user.email, code);
  }
}
