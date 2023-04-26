import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UnprocessableEntityException } from '../../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { EmailSenderService } from '../../../global-services/email-sender.service';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class ResendRegistrationEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase implements ICommandHandler {
  constructor(
    private usersRepository: UsersRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: ResendRegistrationEmailCommand) {
    console.log(command);
    const user = await this.usersRepository.getByEmail(command.email);

    if (user.isConfirmed) {
      throw new UnprocessableEntityException(
        'The email is already confirmed',
        'email',
      );
    }

    user.confirmationCode = uuidv4();
    user.expirationDateOfConfirmationCode = add(Date.now(), { hours: 24 });
    await this.usersRepository.save(user);

    this.emailSenderService.sendRegistrationConfirmationEmail(
      user.email,
      user.confirmationCode,
    );
  }
}
