import { UsersRepository } from '../../users.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand) {
    console.log(command);
    return this.usersRepository.deleteById(command.userId);
  }
}
