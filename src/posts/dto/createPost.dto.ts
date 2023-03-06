import { IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';
import { BlogExists } from '../../common/customValidations/blog-exists';

export class CreatePostDto {
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

  @Validate(BlogExists)
  @IsNotEmpty()
  @Trim()
  @IsString()
  blogId: string;
}
