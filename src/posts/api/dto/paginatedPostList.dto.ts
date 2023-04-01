import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class PaginatedPostListDto extends PaginationQueryParametersDto {
  @IsIn([
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
