import { CommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../../users/users.factory';

export class AdminAddNewUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(AdminAddNewUserCommand)
export class AdminAddNewUserUseCase {
  constructor(private usersFactory: UsersFactory) {}
  async execute(command: AdminAddNewUserCommand) {
    return this.usersFactory.adminAddNewUser(
      command.login,
      command.password,
      command.email,
    );
  }
}
