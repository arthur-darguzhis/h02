import { PaginationQueryParametersDto } from '../../../common/dto/PaginationQueryParametersDto';

export class GetUsersTopListDto extends PaginationQueryParametersDto {
  sort = ['avgScores desc', 'sumScore desc'];
}
