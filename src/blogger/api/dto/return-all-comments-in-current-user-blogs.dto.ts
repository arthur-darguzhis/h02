import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class ReturnAllCommentsInCurrentUserBlogsDto extends PaginationQueryParametersDto {
  @IsIn(['createdAt'])
  @Trim()
  @IsString()
  sortBy = 'createdAt';
}
