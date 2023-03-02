import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostDTO {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  blogId: string;
}
