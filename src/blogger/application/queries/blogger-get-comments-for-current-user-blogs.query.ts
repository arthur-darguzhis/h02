import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../../comments/comments-schema';
import { CommentReaction } from '../../../comments/comment-reaction-schema';
import { CommentReactionsQueryRepository } from '../../../comments/comment-reactions.query-repository';

export class BloggerGetCommentsForCurrentUserBlogsQuery {
  constructor(
    public readonly bloggerId,
    public readonly sortBy,
    public readonly sortDirection,
    public readonly pageNumber,
    public readonly pageSize,
  ) {}
}

@QueryHandler(BloggerGetCommentsForCurrentUserBlogsQuery)
export class BloggerGetCommentsListInBlogHandler implements IQueryHandler {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private commentReactionsQueryRepository: CommentReactionsQueryRepository,
  ) {}
  async execute(query: BloggerGetCommentsForCurrentUserBlogsQuery) {
    const filter = { 'postInfo.postOwnerId': query.bloggerId };

    const count = await this.commentModel.countDocuments(filter);
    const direction = query.sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (query.pageNumber - 1) * query.pageSize;
    const comments = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: direction })
      .skip(howManySkip)
      .limit(query.pageSize)
      .lean();

    const commentsIdList: Array<string> = comments.map((comment) =>
      comment._id.toString(),
    );

    const userReactionsOnComments =
      await this.commentReactionsQueryRepository.getUserReactionOnCommentsBatch(
        commentsIdList,
        query.bloggerId,
      );

    const commentIdAndReactionsList: any = [];
    userReactionsOnComments.forEach((likeData) => {
      commentIdAndReactionsList[likeData.commentId] = likeData.status;
    });

    const items = comments.map((comment) => {
      const likeStatus =
        commentIdAndReactionsList[comment._id.toString()] ||
        CommentReaction.LIKE_STATUS_OPTIONS.NONE;
      return this.mapper(comment, likeStatus);
    });

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: items,
    };
  }

  private mapper(
    comment: CommentDocument,
    myStatus = CommentReaction.LIKE_STATUS_OPTIONS.NONE,
  ) {
    return {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: myStatus,
      },
      postInfo: {
        id: comment.postInfo.id,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    };
  }
}
