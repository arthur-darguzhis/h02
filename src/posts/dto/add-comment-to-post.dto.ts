import { IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class AddCommentToPostDto {
  @Length(20, 300)
  @Trim()
  @IsString()
  content: string;
}
