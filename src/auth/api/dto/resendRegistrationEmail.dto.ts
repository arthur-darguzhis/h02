import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class ResendRegistrationEmailDto {
  @IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;
}
