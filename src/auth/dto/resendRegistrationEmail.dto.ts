import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class ResendRegistrationEmailDto {
  @IsEmail()
  @Trim()
  @IsString()
  email: string;
}
