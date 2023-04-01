import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CommentReactionsDto {
  //TODO убедиться что где то в фабрике точно есть проверка. на то что у нас используется один из типов.
  @IsIn(['Like', 'Dislike', 'None'])
  @IsString()
  @IsNotEmpty()
  likeStatus: string;
}
