import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

export class AdminDeleteUserByIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(AdminDeleteUserByIdCommand)
export class AdminDeleteUserByIdUseCase {
  constructor(private usersPgRepository: UsersRepository) {}
  async execute(command: AdminDeleteUserByIdCommand) {
    console.log(command);
    const user = await this.usersPgRepository.getById(command.userId);
    await this.usersPgRepository.delete(user);
  }
}
