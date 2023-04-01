import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';

export class AdminDeleteUserByIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(AdminDeleteUserByIdCommand)
export class AdminDeleteUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: AdminDeleteUserByIdCommand) {
    await this.usersRepository.deleteById(command.userId);
  }
}
