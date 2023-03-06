import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class PostReaction {
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
  postId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  addedAt: string;
}

export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);

export type PostReactionDocument = HydratedDocument<PostReaction>;
