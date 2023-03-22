import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../common/crutches/class-transformer/trim.decorator';

export class AdminBanOrUnbanUserDto {
  @IsNotEmpty()
  @IsIn([true, false])
  @IsNotEmpty()
  isBanned: boolean;

  @Length(1, 30)
  @Trim()
  @IsString()
  banReason: string;
}
