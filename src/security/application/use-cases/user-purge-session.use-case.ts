import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSessionsPgRepository } from '../../user-sessions-pg.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UserPurgeSessionCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UserPurgeSessionCommand)
export class UserPurgeSessionUseCase implements ICommandHandler {
  constructor(private userSessionsPgRepository: UserSessionsPgRepository) {}
  async execute(command: UserPurgeSessionCommand) {
    const userSession = await this.userSessionsPgRepository.getByDeviceId(
      command.deviceId,
    );

    if (userSession.userId !== command.userId) {
      throw new UnauthorizedActionException('Unable to delete session');
    }

    await this.userSessionsPgRepository.purgeSession(command.deviceId);
  }
}
