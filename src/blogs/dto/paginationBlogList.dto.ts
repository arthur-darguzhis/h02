import { PaginationQueryParametersDto } from '../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class PaginationBlogListDto extends PaginationQueryParametersDto {
  @Trim()
  @IsString()
  @IsOptional()
  searchNameTerm: string;

  @IsIn(['name', 'description', 'websiteUrl', 'createdAt'])
  @Trim()
  @IsString()
  sortBy = 'createdAt';
}
