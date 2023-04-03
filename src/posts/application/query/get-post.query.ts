import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

export class GetPostQuery {
  constructor(
    public readonly postId: string,
    public readonly userId: string = null,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: GetPostQuery) {
    console.log(query);
    const post = await this.dataSource.query(
      `SELECT
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
       WHERE p.is_banned = false AND p.id = $2`,
      [query.userId, query.postId],
    );

    if (post.length === 0) {
      throw new EntityNotFoundException(
        `Post with id: ${query.postId} is not found`,
      );
    }

    return post[0];
  }
}
