import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class BloggerGetListOfBannedUsersInBlogQuery {
  constructor(
    public readonly blogId: string,
    public readonly bloggerId: string,
    public readonly searchLoginTerm: string = null,
    public readonly sortBy: string = 'banDate',
    public readonly sortDirection: string = 'desc',
    public readonly pageNumber: number = 1,
    public readonly pageSize: number = 10,
  ) {}
}

@QueryHandler(BloggerGetListOfBannedUsersInBlogQuery)
export class BloggerGetListOfBannedUsersForBlogHandler
  implements IQueryHandler
{
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsPgRepository: BlogsRepository,
  ) {}

  async execute(query: BloggerGetListOfBannedUsersInBlogQuery) {
    console.log(query);
    const blog = await this.blogsPgRepository.getById(query.blogId);

    if (blog.userId !== query.bloggerId) {
      throw new UnauthorizedActionException(
        'Unauthorized action. This blog belongs to another blogger.',
      );
    }

    const searchLoginTerm = query.searchLoginTerm
      ? `%${query.searchLoginTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT count (*) as count 
            FROM blog_user_ban
                JOIN users ON blog_user_ban.user_id = users.id
            WHERE blog_user_ban.is_banned = true 
              AND blog_user_ban.blog_id = $1 
              AND ($2::varchar is null or users.login ILIKE $2::varchar)`,
      [query.blogId, searchLoginTerm],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const sortFields = {
      login: 'users.login',
      isBanned: 'blog_user_ban.is_banned',
      banDate: 'blog_user_ban.ban_date',
      banReason: 'blog_user_ban.ban_reason',
    };

    const users = await this.dataSource.query(
      `SELECT blog_user_ban.user_id as id,
              users.login as "login",
              json_build_object(
                  'isBanned', blog_user_ban.is_banned,
                  'banDate', to_char(blog_user_ban.ban_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 
                  'banReason', blog_user_ban.ban_reason
                  ) as "banInfo"
              FROM blog_user_ban
                  JOIN users ON blog_user_ban.user_id = users.id
              WHERE blog_user_ban.is_banned = true 
                AND blog_user_ban.blog_id = $1 
                AND ($2::varchar is null or users.login ILIKE $2::varchar)
              ORDER BY ${sortFields[query.sortBy]} ${query.sortDirection}
              LIMIT $3 OFFSET $4`,
      [query.blogId, searchLoginTerm, query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: users,
    };
  }
}
