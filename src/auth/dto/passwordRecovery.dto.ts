import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class PasswordRecoveryDto {
  @IsEmail()
  @Trim()
  @IsNotEmpty()
  email: string;
}
