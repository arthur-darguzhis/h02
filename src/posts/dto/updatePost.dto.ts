import { IsNotEmpty, IsString, Length, Validate } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';
import { BlogExists } from '../../common/customValidations/blog-exists';

export class UpdatePostDto {
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

  //TODO chink is it correct name BlogExists for validation, and should I put this kind of validation to other places?
  @Validate(BlogExists)
  @Trim()
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
