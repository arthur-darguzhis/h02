import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class BlogUserBans {
  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  banReason: string;
}

export const BlogUserBansSchema = SchemaFactory.createForClass(BlogUserBans);

export type BlogUserBansDocument = HydratedDocument<BlogUserBans>;
