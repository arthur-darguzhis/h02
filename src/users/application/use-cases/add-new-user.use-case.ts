import { UsersFactory } from '../../users.factory';
import { CreateUserDto } from '../../api/dto/createUser.dto';
import { UserDocument } from '../../users-schema';
import { CommandHandler } from '@nestjs/cqrs';

export class AddNewUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(AddNewUserCommand)
export class AddNewUserUseCase {
  constructor(private usersFactory: UsersFactory) {}
  async execute(command: AddNewUserCommand): Promise<UserDocument> {
    return await this.usersFactory.adminAddNewUser(command.dto);
  }
}
