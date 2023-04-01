import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class LoginDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  password: string;
}
