import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './users-schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';
import { EntityAlreadyExistsException } from '../common/exceptions/domain.exceptions/entity-already-exists.exception';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async save(userModel: UserDocument): Promise<UserDocument> {
    return userModel.save();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async getById(userId: string): Promise<UserDocument | never> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new EntityNotFoundException(`User with id: ${userId} is not found`);
    }
    return user;
  }

  async getByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserDocument | never> {
    const user = await this.userModel.findOne({
      'emailConfirmationInfo.confirmationCode': confirmationCode,
    });
    if (!user) {
      throw new UnprocessableEntityException(
        `User with confirmationCode: ${confirmationCode} is not found`,
      );
    }
    return user;
  }

  async deleteById(userId: string): Promise<true | never> {
    const isRemoved = await this.userModel.findByIdAndRemove(userId);
    if (!isRemoved) {
      throw new EntityNotFoundException(`User with id: ${userId} is not found`);
    }
    return true;
  }

  async throwIfEmailInUse(email: string): Promise<void | never> {
    const isEmailInUse = await this.userModel.exists({ email });
    if (isEmailInUse) {
      throw new EntityAlreadyExistsException(
        `User with email: ${email} already exists`,
        'email',
      );
    }
  }

  async throwIfLoginInUse(login: string): Promise<void | never> {
    const isLoginInUse = await this.userModel.exists({ login });
    if (isLoginInUse) {
      throw new EntityAlreadyExistsException(
        `User with login: ${login} already exists`,
        'login',
      );
    }
  }

  async getByEmail(email: string): Promise<UserDocument | never> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new EntityAlreadyExistsException(
        `User with email: ${email} does not exist`,
        'email',
      );
    }
    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | never> {
    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) {
      throw new EntityNotFoundException(
        `User with email or login "${loginOrEmail}" does not exist`,
      );
    }
    return user;
  }
}
