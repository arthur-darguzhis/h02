import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CommentReactionsDto {
  @IsIn(['Like', 'Dislike', 'None'])
  @IsString()
  @IsNotEmpty()
  likeStatus: string;
}
