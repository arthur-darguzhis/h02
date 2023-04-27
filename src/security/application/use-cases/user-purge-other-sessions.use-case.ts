import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSessionsRepository } from '../../infrastructure/user-sessions.repository';

export class UserPurgeOtherSessionsCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UserPurgeOtherSessionsCommand)
export class UserPurgeOtherSessionsUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: UserSessionsRepository) {}
  async execute(command: UserPurgeOtherSessionsCommand) {
    console.log(command);
    await this.userSessionsPgRepository.purgeOtherSessions(
      command.deviceId,
      command.userId,
    );
  }
}
