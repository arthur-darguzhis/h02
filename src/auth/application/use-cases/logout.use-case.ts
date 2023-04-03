import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSessionsPgRepository } from '../../../security/user-sessions-pg.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: UserSessionsPgRepository) {}
  async execute(command: LogoutCommand) {
    console.log(command);
    await this.userSessionsPgRepository.removeOne(
      command.deviceId,
      command.userId,
    );
  }
}
