import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../../users/users.factory';
import { EmailSenderService } from '../../../global-services/email-sender.service';
import { UsersPgRepository } from '../../../users/users.pg-repository';

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
    private usersPgRepository: UsersPgRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: RegistrationCommand): Promise<void | never> {
    //TODO when we will use typeOrm entities not raw sql use usersFactory
    // const newUser = await this.usersFactory.registerNewUser(
    //   command.login,
    //   command.password,
    //   command.email,
    // );

    const newUser = await this.usersFactory.registerNewUserPg(
      command.login,
      command.password,
      command.email,
    );

    await this.usersPgRepository.saveNewUser(newUser);
    await this.emailSenderService.sendRegistrationConfirmationEmail(
      command.email,
      newUser.confirmationCode,
    );
  }
}
