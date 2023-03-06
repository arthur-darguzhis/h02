import { IsIn, IsString } from 'class-validator';

export class PostReactionsDto {
  //TODO убедиться что где то в фабрике точно есть проверка. на то что у нас используется один из типов.
  @IsIn(['Like', 'Dislike', 'None'])
  @IsString()
  likeStatus: string;
}
