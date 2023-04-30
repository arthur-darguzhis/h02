import { IsNotEmpty, IsString } from 'class-validator';

export class SendAnswerDto {
  @IsString()
  @IsNotEmpty()
  answer: string;
}
