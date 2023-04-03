import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

export class GetCommentQuery {
  constructor(
    public readonly commentId: string,
    public readonly userId: string = null,
  ) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: GetCommentQuery) {
    console.log(query);
    const comment = await this.dataSource.query(
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
                FROM comments as c 
                JOIN users u ON c.user_id = u.id
                LEFT JOIN comment_reactions cr ON c.id = cr.comment_id AND cr.user_id = $2::uuid
             WHERE c.is_banned = false
               AND c.id = $1`,
      [query.commentId, query.userId],
    );

    if (comment.length === 0) {
      throw new EntityNotFoundException(
        `Comment with ID: ${query.commentId} is not exists`,
      );
    }

    return comment[0];
  }
}
