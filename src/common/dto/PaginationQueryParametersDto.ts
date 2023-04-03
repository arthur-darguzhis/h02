import { IsIn, IsString, Min } from 'class-validator';
import { Trim } from '../crutches/class-transformer/trim.decorator';
import { Type } from 'class-transformer';

export class PaginationQueryParametersDto {
  @IsIn(['asc', 'desc'])
  @Trim()
  @IsString()
  sortDirection = 'desc';

  @Min(1)
  @Type(() => Number)
  @Trim()
  pageSize = 10;

  @Min(1)
  @Type(() => Number)
  @Trim()
  pageNumber = 1;
}
