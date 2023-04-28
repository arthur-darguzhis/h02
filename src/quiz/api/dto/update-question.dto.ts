import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';
import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateQuestionDto {
  @Length(10, 500)
  @Trim()
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsArray()
  @IsNotEmpty()
  correctAnswers: string[];
}
