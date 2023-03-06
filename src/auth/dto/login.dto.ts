import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class LoginDto {
  @IsNotEmpty()
  @Trim()
  @IsString()
  loginOrEmail: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  password: string;
}
