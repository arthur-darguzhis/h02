import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactionsRepository } from './comment-reactions.repository';
import { CommentReactionsFactory } from './comment-reactions.factory';
import { CommentsFactory } from './comments.factory';

@Injectable()
export class CommentsService {
  constructor(
    private commentsFactory: CommentsFactory,
    private commentsRepository: CommentsRepository,
    private commentReactionsRepository: CommentReactionsRepository,
    private commentReactionsFactory: CommentReactionsFactory,
  ) {}

  async updateCommentByOwner(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.commentsRepository.getById(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw new UnauthorizedActionException(
        'Unauthorized updating. This comment belongs to another user.',
      );
    }

    comment.content = dto.content;
    await this.commentsRepository.save(comment);
  }
}
