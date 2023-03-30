import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class BloggerBanUserDto {
  @IsIn([true, false])
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @Trim()
  @IsNotEmpty()
  @IsString()
  banReason: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  blogId: string;
}
