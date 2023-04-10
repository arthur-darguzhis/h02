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
  ) {
    //convert camel case to snake
    this.sortBy = this.sortBy.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
  }
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

    const searchEmailTerm = query.searchEmailTerm
      ? `%${query.searchEmailTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM users WHERE 
        ($1::boolean is null or is_banned = $1::boolean) AND
        (($2::varchar is null or login ILIKE $2::varchar) OR ($3::varchar is null or email ILIKE $3::varchar))`,
      [banStatus, searchLoginTerm, searchEmailTerm],
    );
    count = Number(count[0].count);

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
           (($2::varchar is null or login ILIKE $2::varchar) OR ($3::varchar is null or email ILIKE $3::varchar))
           ORDER BY ${query.sortBy} ${query.sortDirection}
           LIMIT $4 OFFSET $5`,
      [banStatus, searchLoginTerm, searchEmailTerm, query.pageSize, offset],
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
