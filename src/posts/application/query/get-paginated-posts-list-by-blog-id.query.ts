import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { mapPostToViewModel, PostViewModel } from '../../posts.mapper';
import { PostReaction } from '../../post-reaction-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../posts-schema';
import { Model } from 'mongoose';
import { BlogsQueryRepository } from '../../../blogs/blogs.query.repository';
import { PostReactionsQueryRepository } from '../../post-reactions.query-repository';

export class GetPaginatedPostsListByBlogIdQuery {
  constructor(
    public readonly blogId: string,
    public readonly sortBy: string,
    public readonly sortDirection: string,
    public readonly pageSize: number,
    public readonly pageNumber: number,
    public readonly userId = null,
  ) {}
}

@QueryHandler(GetPaginatedPostsListByBlogIdQuery)
export class GetPaginatedPostsListByBlogIdHandler implements IQueryHandler {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsQueryRepository: BlogsQueryRepository,
    private postReactionsQueryRepository: PostReactionsQueryRepository,
  ) {}

  async execute(query: GetPaginatedPostsListByBlogIdQuery) {
    const { sortBy, sortDirection, pageNumber, pageSize, blogId, userId } =
      query;
    await this.blogsQueryRepository.getById(blogId);

    const filter = { blogId: blogId, isBanned: false };
    const count = await this.postModel.countDocuments(filter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: direction })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    let items: PostViewModel[];
    if (userId) {
      const postsIdList: Array<string> = posts.map((post) =>
        post._id.toString(),
      );
      const userReactionsOnComments =
        await this.postReactionsQueryRepository.getUserReactionOnPostBatch(
          postsIdList,
          userId,
        );

      const postsIdAndReactionsList: any = [];
      userReactionsOnComments.forEach((likeData) => {
        postsIdAndReactionsList[likeData.postId] = likeData.status;
      });

      items = posts.map((post) => {
        const likeStatus =
          postsIdAndReactionsList[post._id.toString()] ||
          PostReaction.LIKE_STATUS_OPTIONS.NONE;
        return mapPostToViewModel(post, likeStatus);
      });
    } else {
      items = posts.map((post) => {
        return mapPostToViewModel(post);
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
}
