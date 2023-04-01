import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class UpdateBlogDto {
  @Length(1, 15)
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(1, 500)
  @Trim()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl({ require_protocol: true })
  @Length(1, 100)
  @Trim()
  @IsString()
  @IsNotEmpty()
  websiteUrl: string;
}
