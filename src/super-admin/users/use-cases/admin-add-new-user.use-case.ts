import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../../users/api/dto/createUser.dto';
import { UsersFactory } from '../../../users/users.factory';

export class AdminAddNewUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(AdminAddNewUserCommand)
export class AdminAddNewUserUseCase {
  constructor(private usersFactory: UsersFactory) {}
  async execute(command: AdminAddNewUserCommand) {
    return this.usersFactory.adminAddNewUser(command.dto);
  }
}
