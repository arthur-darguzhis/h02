import { PaginationParameters } from '../../common/types/PaginationParameters';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export class PaginatedUserListDTO extends PaginationParameters {
  @Transform(({ value }) => value.trim())
  searchLoginTerm: string;

  @Transform(({ value }) => value.trim())
  searchEmailTerm: string;

  //TODO вернуть валидацию
  //
  // @IsIn([
  //   'title',
  //   'shortDescription',
  //   'content',
  //   'blogId',
  //   'blogName',
  //   'createdAt',
  // ])
  sortBy = 'createdAt';
}
