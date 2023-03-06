import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class UpdatePostDto {
  @MaxLength(30)
  @Trim()
  @IsString()
  title: string;

  @MaxLength(100)
  @Trim()
  @IsString()
  shortDescription: string;

  @MaxLength(1000)
  @Trim()
  @IsString()
  content: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  blogId: string;
}
