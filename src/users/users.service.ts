import { UsersFactory } from './users.factory';
import { UserDocument } from './users-schema';
import { CreateUserDto } from './dto/createUser.dto';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersFactory: UsersFactory,
    private usersRepository: UsersRepository,
  ) {}

  async addNewUserToSystem(dto: CreateUserDto): Promise<UserDocument> {
    return await this.usersFactory.adminAddNewUser(dto);
  }

  deleteUser(userId: string) {
    return this.usersRepository.deleteById(userId);
  }
}
