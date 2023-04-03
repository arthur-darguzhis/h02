import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class BannedUsersInBlog extends PaginationQueryParametersDto {
  @Trim()
  @IsString()
  @IsOptional()
  searchLoginTerm: string;

  @IsIn(['login', 'banDate', 'banReason'])
  @Trim()
  @IsString()
  sortBy = 'banDate';
}
