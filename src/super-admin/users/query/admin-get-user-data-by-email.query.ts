import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersPgQueryRepository } from '../../../users/infrastructure/users.pg-query-repository';

export class AdminGetUserDataByEmailQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(AdminGetUserDataByEmailQuery)
export class AdminGetUserDataByIdHandler implements IQueryHandler {
  constructor(private usersPgQueryRepository: UsersPgQueryRepository) {}
  async execute(query: AdminGetUserDataByEmailQuery) {
    console.log(query);
    const user = await this.usersPgQueryRepository.findByEmail(query.email);
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
  }
}
