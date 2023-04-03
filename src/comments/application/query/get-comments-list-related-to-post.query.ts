import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsPgRepository } from '../../../posts/infrastructure/posts-pg.repository';

export class GetCommentsListRelatedToPostQuery {
  constructor(
    public readonly postId: string,
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
    public readonly userId: string = null,
  ) {
    this.sortBy = this.sortBy.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
  }
}

@QueryHandler(GetCommentsListRelatedToPostQuery)
export class GetCommentsListRelatedToPostHandler implements IQueryHandler {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private postsPgRepository: PostsPgRepository,
  ) {}

  async execute(query: GetCommentsListRelatedToPostQuery) {
    console.log(query);
    await this.postsPgRepository.throwIfNotExists(query.postId);

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND is_banned = false`,
      [query.postId],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const commentsList = await this.dataSource.query(
      `SELECT
           c.id as "id",
           c.content as "content",
           c.created_at as "createdAt",
           json_build_object(
              'userId', c.user_id,
              'userLogin', u.login
           ) as "commentatorInfo",
            json_build_object(
               'likesCount', c.likes_count,
               'dislikesCount', c.dislikes_count,
               'myStatus', COALESCE(cr.status, 'None')
           ) as "likesInfo"
--             json_build_object(
--                    'id', p.id,
--                    'title', p.title,
--                    'blogId', p.blog_id,
--                    'blogName', b.name
--            ) as "postInfo"
       FROM comments as c
            JOIN users u on c.user_id = u.id
            JOIN posts p on p.id = c.post_id
            JOIN blogs b on b.id = p.blog_id
            LEFT JOIN comment_reactions cr on c.id = cr.comment_id AND cr.user_id = $1
       WHERE c.is_banned = false AND c.post_id = $2
            ORDER BY c.${query.sortBy} ${query.sortDirection}
       LIMIT $3 OFFSET $4`,
      [query.userId, query.postId, query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: commentsList,
    };
  }
}
