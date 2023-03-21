import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './api/dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { RegistrationDto } from '../auth/dto/registration.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersFactory {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersRepository: UsersRepository,
  ) {}

  private async createUser(
    dto: CreateUserDto | RegistrationDto,
    isActive: boolean,
  ): Promise<UserDocument> {
    await this.usersRepository.throwIfEmailInUse(dto.email);
    await this.usersRepository.throwIfLoginInUse(dto.login);

    const user = await this.userModel.create({
      passwordHash: await bcrypt.hash(dto.password, 10),
      isActive: isActive,
      login: dto.login,
      email: dto.email,
      createdAt: new Date().toISOString(),
    });

    if (!isActive) {
      user.generateEmailConfirmationInfo();
    }

    await this.usersRepository.save(user);
    return user;
  }

  public async adminAddNewUser(dto: CreateUserDto): Promise<UserDocument> {
    return this.createUser(dto, true);
  }

  public async registerNewUser(dto: RegistrationDto): Promise<UserDocument> {
    return this.createUser(dto, false);
  }
}
