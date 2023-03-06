import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { CommentViewModel, mapCommentToViewModel } from './comments.mapper';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PaginatedCommentListDto } from './dto/paginated-comment-list.dto';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';
import { CommentReaction } from './comment-reaction-schema';
import { CommentReactionsQueryRepository } from './comment-reactions.query-repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postsQueryRepository: PostsQueryRepository,
    private commentReactionsQueryRepository: CommentReactionsQueryRepository,
  ) {}

  async getById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new EntityNotFoundException(
        `Comment with id: ${commentId} is not found`,
      );
    }
    return mapCommentToViewModel(comment);
  }

  async findByPostId(
    postId: string,
    dto: PaginatedCommentListDto,
    userId = null,
  ) {
    const post = await this.postsQueryRepository.getById(postId);

    const { sortBy, sortDirection, pageNumber, pageSize } = dto;

    const filter = { postId: post.id };
    const count = await this.commentModel.countDocuments(filter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const comments = await this.commentModel
      .find(filter)
      .sort({ [sortBy]: direction })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    let items: CommentViewModel[];
    if (userId) {
      const commentsIdList: Array<string> = comments.map((comment) =>
        comment._id.toString(),
      );
      const userReactionsOnComments =
        await this.commentReactionsQueryRepository.getUserReactionOnCommentsBatch(
          commentsIdList,
          userId,
        );

      const commentIdAndReactionsList: any = [];
      userReactionsOnComments.forEach((likeData) => {
        commentIdAndReactionsList[likeData.commentId] = likeData.status;
      });

      items = comments.map((comment) => {
        const likeStatus =
          commentIdAndReactionsList[comment._id.toString()] ||
          CommentReaction.LIKE_STATUS_OPTIONS.NONE;
        return mapCommentToViewModel(comment, likeStatus);
      });
    } else {
      items = comments.map((comment) => {
        return mapCommentToViewModel(comment);
      });
    }

    return {
      pagesCount: Math.ceil(count / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: count,
      items: items,
    };
  }

  async getByIdForCurrentUser(commentId: string, userId) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment)
      throw new EntityNotFoundException(
        `Comment with ID: ${commentId} is not exists`,
      );

    let myStatus = CommentReaction.LIKE_STATUS_OPTIONS.NONE;
    if (userId) {
      const myReaction =
        await this.commentReactionsQueryRepository.findUserReaction(
          commentId,
          userId,
        );
      if (myReaction) {
        myStatus = myReaction.status;
      }
    }
    return mapCommentToViewModel(comment, myStatus);
  }
}
