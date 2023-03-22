import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
}

/*
 * TODO похоже что во всех mongoose схемах надо добавить какую то валидацию, по тому что.
 *   Данные из DTO могут быть преобразованы и в итоге оказаться невалидными для сохранения.
 * */
@Schema()
export class Blog {
  //TODO стоит ли этот класс расширять от Document? нормально бы работало или нет? где то видел пример что расширили и потом просто через new создавали все что надо.
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true, default: false })
  isMembership: boolean;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true, default: false })
  isBanned: boolean;

  @Prop({ type: BlogOwnerInfo })
  blogOwnerInfo: BlogOwnerInfo;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;
