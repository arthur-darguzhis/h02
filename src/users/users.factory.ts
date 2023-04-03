import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersPgRepository } from './infrastructure/users.pg-repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class UsersFactory {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersRepository: UsersRepository,
    private usersPgRepository: UsersPgRepository,
  ) {}

  private async createUser(
    login: string,
    password: string,
    email: string,
    isActive: boolean,
  ): Promise<UserDocument> {
    await this.usersRepository.throwIfEmailInUse(email);
    await this.usersRepository.throwIfLoginInUse(login);

    const user = await this.userModel.create({
      passwordHash: await bcrypt.hash(password, 10),
      isActive: isActive,
      login: login,
      email: email,
      banInfo: { isBanned: false, banDate: null, banReason: null },
      createdAt: new Date().toISOString(),
    });

    if (!isActive) {
      user.generateEmailConfirmationInfo();
    }

    await this.usersRepository.save(user);
    return user;
  }

  public async adminAddNewUser(login, password, email): Promise<UserDocument> {
    return this.createUser(login, password, email, true);
  }

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

  public async registerNewUser(login, password, email): Promise<UserDocument> {
    return this.createUser(login, password, email, false);
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
