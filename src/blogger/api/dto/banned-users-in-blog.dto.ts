import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class BannedUsersInBlog extends PaginationQueryParametersDto {
  @Trim()
  @IsString()
  @IsOptional()
  searchLoginTerm: string;

  @IsIn(['login', 'banInfo.banDate', 'banInfo.banReason'])
  @Trim()
  @IsString()
  sortBy = 'banInfo.banDate';
}
