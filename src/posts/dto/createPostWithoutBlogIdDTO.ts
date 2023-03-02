import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostWithoutBlogIdDTO {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
