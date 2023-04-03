import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSessionsPgRepository } from '../../infrastructure/user-sessions-pg.repository';

export class UserPurgeOtherSessionsCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UserPurgeOtherSessionsCommand)
export class UserPurgeOtherSessionsUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: UserSessionsPgRepository) {}
  async execute(command: UserPurgeOtherSessionsCommand) {
    console.log(command);
    await this.userSessionsPgRepository.purgeOtherSessions(
      command.deviceId,
      command.userId,
    );
  }
}
