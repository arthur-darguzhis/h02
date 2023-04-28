import { IsBoolean, IsIn, IsNotEmpty } from 'class-validator';

export class SetQuestionPublishStatusDto {
  @IsIn([true, false])
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
