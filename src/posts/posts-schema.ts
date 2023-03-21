import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class PostNewestLikes {
  @Prop({ required: true })
  addedAt: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
}

@Schema()
export class ExtendedLikesInfo {
  @Prop({ required: true, default: 0 })
  likesCount: number;

  @Prop({ required: true, default: 0 })
  dislikesCount: number;

  @Prop({ type: Array<PostNewestLikes> })
  newestLikes: Array<PostNewestLikes>;
}

@Schema()
export class PostOwnerInfo {
  @Prop({ required: true })
  userId: string;
}

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ type: ExtendedLikesInfo })
  extendedLikesInfo: ExtendedLikesInfo;

  @Prop({ type: PostOwnerInfo })
  postOwnerInfo: PostOwnerInfo;

  @Prop({ required: true })
  createdAt: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;
