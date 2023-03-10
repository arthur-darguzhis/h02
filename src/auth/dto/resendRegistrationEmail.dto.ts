import { IsEmail, IsString, Matches } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class ResendRegistrationEmailDto {
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) // @IsEmail()
  @Trim()
  @IsString()
  email: string;
}
