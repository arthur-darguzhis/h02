import { PaginationQueryParametersDto } from '../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../common/crutches/class-transformer/trim.decorator';

export class PaginatedUserListDto extends PaginationQueryParametersDto {
  @Trim()
  @IsString()
  @IsOptional()
  searchLoginTerm: string;

  @Trim()
  @IsString()
  @IsOptional()
  searchEmailTerm: string;

  @IsIn([
    'login',
    'title',
    'shortDescription',
    'content',
    'blogId',
    'blogName',
    'createdAt',
  ])
  @Trim()
  @IsString()
  sortBy = 'createdAt';
}
