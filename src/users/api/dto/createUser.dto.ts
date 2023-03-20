import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class CreateUserDto {
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @Trim()
  @IsString()
  login: string;

  @Length(6, 20)
  @Trim()
  @IsString()
  password: string;

  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) //@IsEmail()
  @Trim()
  @IsString()
  email: string;
}
