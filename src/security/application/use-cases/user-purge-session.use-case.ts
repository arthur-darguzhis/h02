import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { userSessionsRepository } from '../../infrastructure/user-sessions.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UserPurgeSessionCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UserPurgeSessionCommand)
export class UserPurgeSessionUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: userSessionsRepository) {}
  async execute(command: UserPurgeSessionCommand) {
    console.log(command);
    const userSession = await this.userSessionsPgRepository.getByDeviceId(
      command.deviceId,
    );

    if (userSession.userId !== command.userId) {
      throw new UnauthorizedActionException('Unable to delete session');
    }

    await this.userSessionsPgRepository.purgeSession(command.deviceId);
  }
}
