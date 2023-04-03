import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetListOfBlogsByOwnerQuery {
  constructor(
    public readonly currentUserId: string,
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

@QueryHandler(GetListOfBlogsByOwnerQuery)
export class GetListOfBlogsByOwnerHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetListOfBlogsByOwnerQuery) {
    console.log(query);
    const searchNameTerm = query.searchNameTerm
      ? `%${query.searchNameTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM blogs WHERE user_id = $1 AND ($2::varchar is null or name ILIKE $2::varchar)`,
      [query.currentUserId, searchNameTerm],
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
           b.created_at as "createdAt"
--            //TODO rollback this comment
--            json_build_object(
--                'userId', b.user_id,
--                'userLogin', u.login
--            ) as "blogOwnerInfo",
--            json_build_object(
--                'isBanned', b.is_banned,
--                'banDate', b.ban_date
--            ) as "banInfo"
        FROM blogs as b
            JOIN users u on b.user_id = u.id 
        WHERE user_id = $1 AND ($2::varchar is null or name ILIKE $2::varchar)
           ORDER BY b.${query.sortBy} ${query.sortDirection}
           LIMIT $3 OFFSET $4`,
      [query.currentUserId, searchNameTerm, query.pageSize, offset],
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
