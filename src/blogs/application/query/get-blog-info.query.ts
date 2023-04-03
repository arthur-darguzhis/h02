import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

export class GetBlogInfoQuery {
  constructor(public readonly blogId: string) {}
}

@QueryHandler(GetBlogInfoQuery)
export class GetBlogInfoHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetBlogInfoQuery) {
    console.log(query);
    let blog = await this.dataSource.query(
      `SELECT 
    id,
    name,
    description,
    website_url as "websiteUrl",
    is_membership as "isMembership",
    created_at as "createdAt"
--//TODO rollback these changes
--     json_build_object(
--         'isBanned', is_banned,
--         'banDate', ban_date
--         ) as "banInfo"
    FROM blogs WHERE id = $1 AND is_banned = false`,
      [query.blogId],
    );

    blog = blog[0] || null;

    if (!blog) {
      throw new EntityNotFoundException(
        `Blog with id: ${query.blogId} is not found`,
      );
    }

    return blog;
  }
}
