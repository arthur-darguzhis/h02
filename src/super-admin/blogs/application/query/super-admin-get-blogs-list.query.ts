import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class SuperAdminGetBlogsListQuery {
  constructor(
    public readonly searchNameTerm: string = null,
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
  ) {
    //convert camel case to snake case
    this.sortBy = this.sortBy.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
  }
}

@QueryHandler(SuperAdminGetBlogsListQuery)
export class SuperAdminGetBlogsListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: SuperAdminGetBlogsListQuery) {
    console.log(query);
    const searchNameTerm = query.searchNameTerm
      ? `%${query.searchNameTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count 
              FROM blogs 
              WHERE ($1::varchar IS NULL OR blogs.name ILIKE $1::varchar)`,
      [searchNameTerm],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const blogs = await this.dataSource.query(
      `SELECT
              b.id as "id",
              b.name as "name",
              b.description as "description",
              b.website_url as "websiteUrl",
              b.is_membership as "isMembership",
              b.created_at as "createdAt",
              json_build_object(
                      'userId', b.user_id,
                      'userLogin', u.login
                  ) as "blogOwnerInfo",
              json_build_object(
                      'isBanned', b.is_banned,
                      'banDate', b.ban_date
                  ) as "banInfo"
            FROM blogs as b
            JOIN users u on b.user_id = u.id
            WHERE ($1::varchar IS NULL OR b.name ILIKE $1::varchar)
            ORDER BY b.${query.sortBy} ${query.sortDirection}
            LIMIT $2 OFFSET $3`,
      [searchNameTerm, query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: blogs,
    };
  }
}
