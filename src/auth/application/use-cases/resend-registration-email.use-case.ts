import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/users.pg-repository';
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
    private usersPgRepository: UsersPgRepository,
    private emailSenderService: EmailSenderService,
  ) {}
  async execute(command: ResendRegistrationEmailCommand) {
    const user = await this.usersPgRepository.getByEmail(command.email);
    if (user.isConfirmed) {
      throw new UnprocessableEntityException(
        'The email is already confirmed',
        'email',
      );
    }

    await this.usersPgRepository.refreshEmailConfirmationInfo(
      user.id,
      uuidv4(),
      add(Date.now(), { hours: 24 }),
    );

    await this.emailSenderService.sendRegistrationConfirmationEmail(
      user.email,
      user.confirmationCode,
    );
  }
}
