import { IsIn, Min } from 'class-validator';

export class PaginationParameters {
  sortBy = 'createdAt';

  @IsIn(['asc', 'desc'])
  sortDirection = 'desc';

  @Min(1)
  pageSize = 10;

  @Min(1)
  pageNumber = 1;
}
