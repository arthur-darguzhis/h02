import { IsNotEmpty, Length, Matches } from 'class-validator';

export class UpdateBlogDto {
  @IsNotEmpty()
  @Length(1, 15)
  name: string;

  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsNotEmpty()
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
