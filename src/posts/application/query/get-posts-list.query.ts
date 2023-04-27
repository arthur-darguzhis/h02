import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetPostsListQuery {
  constructor(
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
    public readonly userId = null,
  ) {}
}

@QueryHandler(GetPostsListQuery)
export class GetPostsListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: GetPostsListQuery) {
    console.log(query);
    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count 
                FROM posts 
                WHERE is_banned = false`,
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const sortFields = {
      title: 'p.title',
      shortDescription: 'p.short_description',
      content: 'p.content',
      blogId: 'p.blog_id',
      blogName: 'b.name',
      createdAt: 'p.created_at',
    };

    const items = await this.dataSource.query(
      `
            SELECT
                p.id as "id",
                p.title as "title",
                p.short_description as "shortDescription",
                p.content as "content",
                p.blog_id as "blogId",
                b.name as "blogName",
                p.created_at as "createdAt",
                json_build_object(
                    'likesCount', p.likes_count,
                    'dislikesCount', p.dislikes_count,
                    'newestLikes', COALESCE(p.newest_likes, '[]'),
                    'myStatus', COALESCE(pr.status, 'None')
                ) as "extendedLikesInfo"
            FROM posts as p
                JOIN blogs b on p.blog_id = b.id
                LEFT JOIN post_reactions pr on p.id = pr.post_id AND pr.user_id = $1::uuid
              WHERE p.is_banned = false
            ORDER BY ${sortFields[query.sortBy]} ${query.sortDirection}
              LIMIT $2 OFFSET $3`,
      [query.userId, query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: items,
    };
  }
}
