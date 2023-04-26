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
    private usersPgRepository: UsersRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: ResendRegistrationEmailCommand) {
    console.log(command);
    let user;
    try {
      user = await this.usersPgRepository.getByEmail(command.email);
    } catch (e) {
      throw new UnprocessableEntityException(
        `User with email: ${command.email} is not found`,
        'email',
      );
    }
    if (user.isConfirmed) {
      throw new UnprocessableEntityException(
        'The email is already confirmed',
        'email',
      );
    }

    const newConfirmationCode = uuidv4();
    await this.usersPgRepository.refreshEmailConfirmationInfo(
      user.id,
      newConfirmationCode,
      add(Date.now(), { hours: 24 }),
    );

    this.emailSenderService.sendRegistrationConfirmationEmail(
      user.email,
      newConfirmationCode,
    );
  }
}
