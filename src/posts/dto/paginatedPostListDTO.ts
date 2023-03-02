import { PaginationParameters } from '../../common/types/PaginationParameters';
import { IsIn } from 'class-validator';

export class PaginatedPostListDTO extends PaginationParameters {
  @IsIn([
    'title',
    'shortDescription',
    'content',
    'blogId',
    'blogName',
    'createdAt',
  ])
  sortBy = 'createdAt';
}
