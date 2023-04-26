import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { User } from './application/entities/user';

@Injectable()
export class UsersFactory {
  constructor(private usersPgRepository: UsersRepository) {}

  public async adminAddNewUser(login, password, email) {
    await this.usersPgRepository.throwIfLoginInUse(login);
    await this.usersPgRepository.throwIfEmailInUse(email);

    const user = new User();
    user.passwordHash = await bcrypt.hash(password, 10);
    user.login = login;
    user.email = email;
    user.createdAt = new Date();
    user.confirmationCode = null;
    user.expirationDateOfConfirmationCode = null;
    user.isConfirmed = true;
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;

    return user;
  }

  public async registerNewUser(login, password, email) {
    await this.usersPgRepository.throwIfLoginInUse(login);
    await this.usersPgRepository.throwIfEmailInUse(email);

    const user = new User();
    user.passwordHash = await bcrypt.hash(password, 10);
    user.login = login;
    user.email = email;
    user.createdAt = new Date();
    user.confirmationCode = uuidv4();
    user.expirationDateOfConfirmationCode = add(Date.now(), { hours: 24 });
    user.isConfirmed = false;
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    return user;
  }
}
