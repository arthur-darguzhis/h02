import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetBlogsListQuery {
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

@QueryHandler(GetBlogsListQuery)
export class GetBlogsListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetBlogsListQuery) {
    console.log(query);
    const searchNameTerm = query.searchNameTerm
      ? `%${query.searchNameTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count 
              FROM blogs 
              WHERE is_banned = false 
                AND ($1::varchar IS NULL OR blogs.name ILIKE $1::varchar)`,
      [searchNameTerm],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const blogs = await this.dataSource.query(
      `SELECT
              id as "id",
              name as "name",
              description as "description",
              website_url as "websiteUrl",
              is_membership as "isMembership",
              created_at as "createdAt"
--               json_build_object(
--                       'isBanned', is_banned,
--                       'banDate', ban_date
--                   ) as "banInfo"
            FROM blogs
            WHERE is_banned = false 
              AND ($1::varchar IS NULL OR blogs.name ILIKE $1::varchar)
            ORDER BY blogs.${query.sortBy} ${query.sortDirection}
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
