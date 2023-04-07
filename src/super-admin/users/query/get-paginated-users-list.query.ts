import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetPaginatedUsersListQuery {
  constructor(
    public readonly banStatus: string = 'all',
    public readonly searchLoginTerm: string = null,
    public readonly searchEmailTerm: string = null,
    public readonly sortBy = 'createdAt',
    public readonly sortDirection = 'desc',
    public readonly pageSize = 10,
    public readonly pageNumber = 1,
  ) {}
}

@QueryHandler(GetPaginatedUsersListQuery)
export class GetPaginatedUsersListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetPaginatedUsersListQuery) {
    let banStatus;

    if (query.banStatus === 'banned') {
      banStatus = true;
    }
    if (query.banStatus === 'notBanned') {
      banStatus = false;
    }

    const searchLoginTerm = query.searchLoginTerm
      ? `%${query.searchLoginTerm}%`
      : null;

    const searchEmailTerm = query.searchLoginTerm
      ? `%${query.searchLoginTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM users WHERE 
        ($1::boolean is null or is_banned = $1::boolean) AND
        (($2::varchar is null or login LIKE $2::varchar) OR ($3::varchar is null or email LIKE $3::varchar))`,
      [banStatus, searchLoginTerm, searchEmailTerm],
    );
    count = count[0].count;

    const offset = (query.pageNumber - 1) * query.pageSize;

    const users = await this.dataSource.query(
      `SELECT 
      id, 
      login,
      email,
      created_at as "createdAt",
      is_banned as "isBanned",
      ban_date as "banDate",
      ban_reason as "banReason"
      FROM users WHERE
           ($1::boolean is null or is_banned = $1::boolean) AND
           (($2::varchar is null or login LIKE $2::varchar) OR ($3::varchar is null or email LIKE $3::varchar))
           ORDER BY $4, $5
           LIMIT $6 OFFSET $7`,
      [
        banStatus,
        searchLoginTerm,
        searchEmailTerm,
        query.sortBy,
        query.sortDirection,
        query.pageSize,
        offset,
      ],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: users.map((user) => {
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
      }),
    };
  }
}
