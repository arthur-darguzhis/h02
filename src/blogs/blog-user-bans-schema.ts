import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class BanInfo {
  @Prop({ required: true, default: false })
  isBanned: boolean;

  @Prop({ required: false, type: String, default: null })
  banDate: string | null;

  @Prop({ required: false, type: String, default: null })
  banReason: string | null;
}

@Schema()
export class BlogUserBans {
  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: false, type: BanInfo })
  banInfo: BanInfo;
}

export const BlogUserBansSchema = SchemaFactory.createForClass(BlogUserBans);

export type BlogUserBansDocument = HydratedDocument<BlogUserBans>;
