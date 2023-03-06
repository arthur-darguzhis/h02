import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class SetNewPasswordDto {
  @Length(6, 20)
  @Trim()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  recoveryCode: string;
}
