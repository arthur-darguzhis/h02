import { UsersFactory } from './users.factory';
import { UserDocument } from './users-schema';
import { CreateUserDto } from './dto/createUserDto';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersFactory: UsersFactory,
    private usersRepository: UsersRepository,
  ) {}

  async addNewUserToSystem(dto: CreateUserDto): Promise<UserDocument> {
    const newUser = await this.usersFactory.adminAddNewUser(dto);
    return await this.usersRepository.save(newUser);
  }

  deleteUser(userId: string) {
    return this.usersRepository.deleteById(userId);
  }
}
