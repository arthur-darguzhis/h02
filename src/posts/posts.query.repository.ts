import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { mapPostToViewModel, PostViewModel } from './posts.mapper';
import { PaginatedPostListDto } from './dto/paginatedPostList.dto';
import { PaginationQueryParametersDto } from '../common/dto/PaginationQueryParametersDto';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { EntityNotFoundException } from '../common/exceptions/domain.exceptions/entity-not-found.exception';
import { PostReaction } from './post-reaction-schema';
import { PostReactionsQueryRepository } from './post-reactions.query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsQueryRepository: BlogsQueryRepository,
    private postReactionsQueryRepository: PostReactionsQueryRepository,
  ) {}

  async getById(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }
    return mapPostToViewModel(post);
  }

  async getPaginatedPostsList(dto: PaginatedPostListDto, userId = null) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto;

    const count = await this.postModel.countDocuments({});
    const direction = sortDirection === 'asc' ? 1 : -1;
    const howManySkip = (pageNumber - 1) * pageSize;
    const posts = await this.postModel
      .find({})
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

  async getPaginatedPostsListByBlogId(
    blogId: string,
    dto: PaginationQueryParametersDto,
    userId = null,
  ) {
    await this.blogsQueryRepository.getById(blogId);
    const { sortBy, sortDirection, pageNumber, pageSize } = dto;

    const filter = { blogId: blogId };
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

  async getByIdForCurrentUser(postId: string, currentUserId = null) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new EntityNotFoundException(`Post with id: ${postId} is not found`);
    }

    let myStatus = PostReaction.LIKE_STATUS_OPTIONS.NONE;
    if (currentUserId) {
      const myReaction =
        await this.postReactionsQueryRepository.findUserReaction(
          postId,
          currentUserId,
        );
      if (myReaction) {
        myStatus = myReaction.status;
      }
    }

    return mapPostToViewModel(post, myStatus);
  }
}
