import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSessionsRepository } from '../../../security/infrastructure/user-sessions.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: UserSessionsRepository) {}
  async execute(command: LogoutCommand) {
    console.log(command);
    await this.userSessionsPgRepository.remove(
      command.deviceId,
      command.userId,
    );
  }
}
