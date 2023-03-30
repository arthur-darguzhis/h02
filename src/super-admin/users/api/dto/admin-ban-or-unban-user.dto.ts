import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../../common/crutches/class-transformer/trim.decorator';

export class AdminBanOrUnbanUserDto {
  @IsIn([true, false])
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @Trim()
  @IsString()
  @IsNotEmpty()
  banReason: string;
}
