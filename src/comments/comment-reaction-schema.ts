import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class CommentReaction {
  public static readonly LIKE_STATUS_OPTIONS = {
    NONE: 'None',
    LIKE: 'Like',
    DISLIKE: 'Dislike',
  };

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true, default: false })
  isBanned: boolean;
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);

export type CommentReactionDocument = HydratedDocument<CommentReaction>;
