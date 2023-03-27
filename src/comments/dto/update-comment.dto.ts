import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class UpdateCommentDto {
  @Length(20, 300)
  @Trim()
  @IsString()
  @IsNotEmpty()
  content: string;
}
