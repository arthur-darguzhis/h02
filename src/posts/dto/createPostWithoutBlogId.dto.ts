import { IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class CreatePostWithoutBlogIdDto {
  @Length(1, 30)
  @Trim()
  @IsString()
  title: string;

  @Length(1, 100)
  @Trim()
  @IsString()
  shortDescription: string;

  @Length(1, 1000)
  @Trim()
  @IsString()
  content: string;
}
