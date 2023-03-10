import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

@Schema()
export class EmailConfirmationInfo {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: number;

  @Prop({ required: true })
  isConfirmed: boolean;
}

@Schema()
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: false, type: EmailConfirmationInfo })
  emailConfirmationInfo: EmailConfirmationInfo;

  isUserConfirmed(): boolean {
    return this.emailConfirmationInfo.isConfirmed;
  }

  isConfirmationCodeExpired(): boolean {
    return this.emailConfirmationInfo.expirationDate < new Date().getTime();
  }
  confirmEmailAndActivateAccount() {
    this.isActive = true;
    this.emailConfirmationInfo.isConfirmed = true;
    return this;
  }

  confirmRegistration() {
    if (this.isUserConfirmed()) {
      throw new UnprocessableEntityException('The email is already confirmed');
    }

    if (this.isConfirmationCodeExpired()) {
      throw new UnprocessableEntityException(
        'The confirmation code is expired',
      );
    }
    this.confirmEmailAndActivateAccount();
  }

  hasEmailConfirmationCode(): boolean {
    return Boolean(this.emailConfirmationInfo?.confirmationCode);
  }

  generateEmailConfirmationInfo(): this {
    this.emailConfirmationInfo = {
      confirmationCode: uuidv4(),
      expirationDate: add(Date.now(), { hours: 24 }).getTime(),
      isConfirmed: false,
    };
    return this;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

Object.assign(UserSchema.methods, {
  isUserConfirmed: User.prototype.isUserConfirmed,
  isConfirmationCodeExpired: User.prototype.isConfirmationCodeExpired,
  confirmEmailAndActivateAccount: User.prototype.confirmEmailAndActivateAccount,
  confirmRegistration: User.prototype.confirmRegistration,
  hasEmailConfirmationCode: User.prototype.hasEmailConfirmationCode,
  generateEmailConfirmationInfo: User.prototype.generateEmailConfirmationInfo,
});

export type UserDocument = HydratedDocument<User>;
