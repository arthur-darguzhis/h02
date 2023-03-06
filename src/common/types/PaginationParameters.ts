import { IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationParameters {
  sortBy = 'createdAt';

  //TODO вернуть валидацию
  // @IsIn(['asc', 'desc'])
  sortDirection = 'desc';

  //TODO вернуть валидацию
  // @Min(1)
  @Transform(({ value }) => Number(value))
  pageSize = 10;

  //TODO вернуть валидацию
  // @Min(1)
  @Transform(({ value }) => Number(value))
  pageNumber = 1;
}
