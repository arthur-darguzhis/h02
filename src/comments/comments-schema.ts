import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class CommentLikeInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;
}

@Schema()
export class PostInfo {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  postOwnerId: string;
}

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  postId: string;

  @Prop({ type: PostInfo })
  postInfo: PostInfo;

  @Prop({ required: true, default: false })
  isBanned: boolean;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ type: CommentLikeInfo })
  likesInfo: CommentLikeInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
