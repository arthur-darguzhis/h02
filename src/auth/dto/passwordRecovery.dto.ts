import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class PasswordRecoveryDto {
  @IsEmail()
  @Trim()
  @IsString()
  email: string;
}
