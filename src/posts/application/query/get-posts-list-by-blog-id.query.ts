import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class GetPostsListByBlogIdQuery {
  constructor(
    public readonly blogId: string,
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
    public readonly userId = null,
  ) {}
}

@QueryHandler(GetPostsListByBlogIdQuery)
export class GetPostsListByBlogIdHandler implements IQueryHandler {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private blogsPgRepository: BlogsRepository,
  ) {}

  async execute(query: GetPostsListByBlogIdQuery) {
    console.log(query);

    await this.blogsPgRepository.throwIfNotExists(query.blogId);
    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count 
            FROM posts 
              WHERE blog_id = $1 AND is_banned = false`,
      [query.blogId],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const sortFields = {
      title: 'p.title',
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
                    'newestLikes', p.newest_likes,
                    'myStatus', COALESCE(pr.status, 'None')
                ) as "extendedLikesInfo"
            FROM posts as p
                JOIN blogs b on p.blog_id = b.id
                LEFT JOIN post_reactions pr on p.id = pr.post_id AND pr.user_id = $1::uuid
              WHERE p.blog_id = $2::uuid AND p.is_banned = false
            ORDER BY ${sortFields[query.sortBy]} ${query.sortDirection}
              LIMIT $3 OFFSET $4`,
      [query.userId, query.blogId, query.pageSize, offset],
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
