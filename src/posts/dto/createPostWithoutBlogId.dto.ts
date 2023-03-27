import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class CreatePostWithoutBlogIdDto {
  @Length(1, 30)
  @Trim()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Length(1, 100)
  @Trim()
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @Length(1, 1000)
  @Trim()
  @IsString()
  @IsNotEmpty()
  content: string;
}
