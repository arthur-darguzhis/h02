import { CommandHandler } from '@nestjs/cqrs';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';

export class AdminDeleteUserByIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(AdminDeleteUserByIdCommand)
export class AdminDeleteUserByIdUseCase {
  constructor(private usersPgRepository: UsersPgRepository) {}
  async execute(command: AdminDeleteUserByIdCommand) {
    console.log(command);
    await this.usersPgRepository.throwIfUserIsNotExists(command.userId);
    await this.usersPgRepository.deleteById(command.userId);
  }
}
