import { IsString, IsUrl, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class CreateBlogDto {
  @Length(1, 15)
  @Trim()
  @IsString()
  name: string;

  @Length(1, 500)
  @Trim()
  @IsString()
  description: string;

  @IsUrl({ require_protocol: true })
  @Length(1, 100)
  @Trim()
  @IsString()
  websiteUrl: string;
}
