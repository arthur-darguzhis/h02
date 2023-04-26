import { CommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../../../users/users.factory';
import { UsersPgRepository } from '../../../../users/infrastructure/users.pg-repository';

export class AdminAddNewUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(AdminAddNewUserCommand)
export class AdminAddNewUserUseCase {
  constructor(
    private usersFactory: UsersFactory,
    private usersPgRepository: UsersPgRepository,
  ) {}
  async execute(command: AdminAddNewUserCommand) {
    console.log(command);
    const user = await this.usersFactory.adminAddNewUserPg(
      command.login,
      command.password,
      command.email,
    );

    await this.usersPgRepository.saveNewUser(user);
  }
}