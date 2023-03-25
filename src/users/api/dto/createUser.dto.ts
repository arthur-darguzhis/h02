import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class CreateUserDto {
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @Trim()
  @IsString()
  @IsNotEmpty()
  login: string;

  @Length(6, 20)
  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) //@IsEmail()
  @Trim()
  @IsString()
  @IsNotEmpty()
  email: string;
}
