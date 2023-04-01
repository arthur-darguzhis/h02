import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class SetNewPasswordDto {
  @Length(6, 20)
  @Trim()
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
