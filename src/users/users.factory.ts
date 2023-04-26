import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class UsersFactory {
  constructor(private usersPgRepository: UsersRepository) {}

  public async adminAddNewUserPg(login, password, email) {
    await this.usersPgRepository.throwIfLoginInUse(login);
    await this.usersPgRepository.throwIfEmailInUse(email);

    return {
      passwordHash: await bcrypt.hash(password, 10),
      login: login,
      email: email,
      createdAt: new Date(),
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true,
      isBanned: false,
      banDate: null,
      banReason: null,
    };
  }

  public async registerNewUserPg(login, password, email) {
    await this.usersPgRepository.throwIfLoginInUse(login);
    await this.usersPgRepository.throwIfEmailInUse(email);

    return {
      passwordHash: await bcrypt.hash(password, 10),
      login: login,
      email: email,
      createdAt: new Date(),
      confirmationCode: uuidv4(),
      expirationDate: add(Date.now(), { hours: 24 }),
      isConfirmed: false,
      isBanned: false,
      banDate: null,
      banReason: null,
    };
  }
}
