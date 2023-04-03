import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersPgQueryRepository } from '../../../users/infrastructure/users.pg-query-repository';

export class CurrentUserInfoQuery {
  constructor(public readonly currentUserId: string) {}
}

@QueryHandler(CurrentUserInfoQuery)
export class CurrentUserInfoHandler implements IQueryHandler {
  constructor(private usersPgQueryRepository: UsersPgQueryRepository) {}
  async execute(query: CurrentUserInfoQuery) {
    console.log(query);
    return await this.usersPgQueryRepository.findOne(query.currentUserId);
  }
}
