import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../../comments/comments-schema';

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
  ) {}
  async execute(query: BloggerGetCommentsForCurrentUserBlogsQuery) {
    const filter = { 'postInfo.postOwnerId': query.bloggerId };

    const count = await this.commentModel.countDocuments(filter);
    const direction = query.sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (query.pageNumber - 1) * query.pageSize;
    const users = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: direction })
      .skip(howManySkip)
      .limit(query.pageSize)
      .lean();

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: users.map(this.mapper),
    };
  }

  private mapper(comment: CommentDocument) {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      postInfo: {
        id: comment.postInfo.id,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    };
  }
}
