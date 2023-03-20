import { Injectable } from '@nestjs/common';
import { UsersFactory } from '../users.factory';
import { CreateUserDto } from '../dto/createUser.dto';
import { UserDocument } from '../users-schema';

@Injectable()
export class AddNewUserUseCase {
  constructor(private usersFactory: UsersFactory) {}

  async execute(dto: CreateUserDto): Promise<UserDocument> {
    return await this.usersFactory.adminAddNewUser(dto);
  }
}
