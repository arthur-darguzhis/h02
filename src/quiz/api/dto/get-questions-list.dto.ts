import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../common/crutches/class-transformer/trim.decorator';

export class GetQuestionsListDto extends PaginationQueryParametersDto {
  @Trim()
  @IsString()
  @IsOptional()
  bodySearchTerm: string;

  @IsIn(['all', 'published', 'notPublished'])
  @Trim()
  @IsString()
  publishedStatus = 'all';

  @IsIn(['createdAt', 'updatedAt', 'published', 'body'])
  @Trim()
  @IsString()
  sortBy = 'createdAt';
}
