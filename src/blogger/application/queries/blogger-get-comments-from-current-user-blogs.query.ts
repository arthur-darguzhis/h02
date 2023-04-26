import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class BloggerGetCommentsFromCurrentUserBlogsQuery {
  constructor(
    public readonly bloggerId,
    public readonly sortBy,
    public readonly sortDirection,
    public readonly pageNumber,
    public readonly pageSize,
  ) {
    this.sortBy = this.sortBy.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
  }
}

@QueryHandler(BloggerGetCommentsFromCurrentUserBlogsQuery)
export class BloggerGetCommentsListInBlogHandler implements IQueryHandler {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersPgRepository: UsersRepository,
  ) {}

  async execute(query: BloggerGetCommentsFromCurrentUserBlogsQuery) {
    console.log(query);
    await this.usersPgRepository.throwIfUserIsNotExists(query.bloggerId);

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count 
              FROM comments as c
                 JOIN posts p on p.id = c.post_id
                 JOIN blogs b on b.id = p.blog_id 
              WHERE b.user_id = $1`,
      [query.bloggerId],
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
           ) as "likesInfo",
            json_build_object(
                   'id', p.id,
                   'title', p.title,
                   'blogId', p.blog_id,
                   'blogName', b.name
           ) as "postInfo"
       FROM comments as c
            JOIN users u on c.user_id = u.id
            JOIN posts p on p.id = c.post_id
            JOIN blogs b on b.id = p.blog_id
            LEFT JOIN comment_reactions cr on c.id = cr.comment_id AND cr.user_id = $1
       WHERE b.user_id = $1
            ORDER BY c.${query.sortBy} ${query.sortDirection}
       LIMIT $2 OFFSET $3`,
      [query.bloggerId, query.pageSize, offset],
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
