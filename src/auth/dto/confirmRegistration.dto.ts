import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class ConfirmRegistrationDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  code: string;
}
