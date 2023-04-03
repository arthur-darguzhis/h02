import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class PaginationPostsByBlogIdDto extends PaginationQueryParametersDto {
  @IsIn(['createdAt', 'title'])
  @Trim()
  @IsString()
  sortBy = 'createdAt';
}
