import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class GetUserGamesHistoryListDto extends PaginationQueryParametersDto {
  @IsIn(['pairCreatedDate'])
  @Trim()
  @IsString()
  sortBy = 'pairCreatedDate';
}
