import { IsIn, Min } from 'class-validator';

export class PaginationParameters {
  sortBy = 'createdAt';

  //TODO вернуть валидацию
  // @IsIn(['asc', 'desc'])
  sortDirection = 'desc';

  //TODO вернуть валидацию
  // @Min(1)
  pageSize = 10;

  //TODO вернуть валидацию
  // @Min(1)
  pageNumber = 1;
}
