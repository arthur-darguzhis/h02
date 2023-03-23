import { IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../../common/crutches/class-transformer/trim.decorator';

export class AdminBanOrUnbanUserDto {
  @IsNotEmpty()
  @IsIn([true, false])
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @Trim()
  @IsString()
  banReason: string;
}
