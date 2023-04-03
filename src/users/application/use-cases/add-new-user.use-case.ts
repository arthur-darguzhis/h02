import { UsersFactory } from '../../users.factory';
import { UserDocument } from '../../users-schema';
import { CommandHandler } from '@nestjs/cqrs';

export class AddNewUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(AddNewUserCommand)
export class AddNewUserUseCase {
  constructor(private usersFactory: UsersFactory) {}
  async execute(command: AddNewUserCommand): Promise<UserDocument> {
    return await this.usersFactory.adminAddNewUser(
      command.login,
      command.password,
      command.email,
    );
  }
}
