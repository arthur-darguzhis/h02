import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../../users/users.factory';
import { EmailSenderService } from '../../../global-services/email-sender.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class RegistrationCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler {
  constructor(
    private usersFactory: UsersFactory,
    private usersPgRepository: UsersRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: RegistrationCommand): Promise<void | never> {
    console.log(command);
    const newUser = await this.usersFactory.registerNewUser(
      command.login,
      command.password,
      command.email,
    );

    await this.usersPgRepository.save(newUser);
    this.emailSenderService.sendRegistrationConfirmationEmail(
      command.email,
      newUser.confirmationCode,
    );
  }
}
