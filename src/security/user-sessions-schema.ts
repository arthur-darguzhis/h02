import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class UserSessions {
  @Prop({ required: true })
  issuedAt: number;

  @Prop({ required: true })
  expireAt: number;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  userId: string;
}

export const UserSessionsSchema = SchemaFactory.createForClass(UserSessions);

export type UserSessionsDocument = HydratedDocument<UserSessions>;
