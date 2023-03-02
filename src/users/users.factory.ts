import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users-schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersFactory {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async adminAddNewUser(
    createUserDto: CreateUserDto,
  ): Promise<UserDocument> {
    const password = await bcrypt.hash(createUserDto.password, 10);

    return this.userModel.create({
      passwordHash: password,
      isActive: true,
      login: createUserDto.login,
      email: createUserDto.email,
    });
  }
}
