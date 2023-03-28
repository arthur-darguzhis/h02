import { IsBoolean, IsIn, IsNotEmpty } from 'class-validator';

export class AdminBanOrUnbanBlogDto {
  @IsIn([true, false])
  @IsBoolean()
  @IsNotEmpty()
  'isBanned': boolean;
}
