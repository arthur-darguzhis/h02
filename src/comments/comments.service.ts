import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { UnauthorizedActionException } from '../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactionsDto } from './dto/comment-reactions.dto';
import { CommentReactionsRepository } from './comment-reactions.repository';
import { CommentReactionsFactory } from './comment-reactions.factory';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsFactory } from './comments.factory';

@Injectable()
export class CommentsService {
  constructor(
    private commentsFactory: CommentsFactory,
    private commentsRepository: CommentsRepository,
    private commentReactionsRepository: CommentReactionsRepository,
    private commentReactionsFactory: CommentReactionsFactory,
    private postsRepository: PostsRepository,
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

  async deleteCommentByOwner(commentId: string, userId: string) {
    const comment = await this.commentsRepository.getById(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw new UnauthorizedActionException(
        'Unauthorized deletion. This comment belongs to another user.',
      );
    }

    return this.commentsRepository.deleteById(commentId);
  }

  async addReaction(
    commentId: string,
    currentUserId: string,
    dto: CommentReactionsDto,
  ) {
    await this.commentsRepository.throwIfNotExists(commentId);
    const userReaction = await this.commentReactionsRepository.findUserReaction(
      commentId,
      currentUserId,
    );

    if (!userReaction) {
      await this.commentReactionsFactory.createNewCommentReaction(
        commentId,
        currentUserId,
        dto,
      );
    } else {
      if (userReaction.status === dto.likeStatus) {
        return true;
      }
      userReaction.status = dto.likeStatus;
      await this.commentReactionsRepository.save(userReaction);
    }

    await this.updateCommentReactionsCount(commentId);
  }

  public async updateCommentReactionsCount(commentId: string) {
    const likesCount =
      await this.commentReactionsRepository.calculateCountOfLikes(commentId);
    const dislikesCount =
      await this.commentReactionsRepository.calculateCountOfDislikes(commentId);
    await this.commentsRepository.updateLikesInfo(
      commentId,
      likesCount,
      dislikesCount,
    );
  }
}
