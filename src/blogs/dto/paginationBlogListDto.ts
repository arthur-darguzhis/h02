import { PaginationParameters } from '../../common/types/PaginationParameters';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export class PaginationBlogListDto extends PaginationParameters {
  @Transform(({ value }) => value.trim())
  searchNameTerm: string;

  @IsIn(['name', 'description', 'websiteUrl', 'createdAt'])
  sortBy = 'createdAt';
}
