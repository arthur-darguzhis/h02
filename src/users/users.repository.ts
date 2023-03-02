import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async save(userModel: UserDocument): Promise<UserDocument> {
    return userModel.save();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }
    return user;
  }

  async getById(userId: string): Promise<UserDocument | never> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return user;
  }

  async deleteById(userId: string): Promise<true | never> {
    const isRemoved = await this.userModel.findByIdAndRemove(userId);

    if (!isRemoved) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return true;
  }
}
