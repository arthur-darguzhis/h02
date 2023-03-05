import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts-schema';
import { Model } from 'mongoose';
import { mapPostToViewModel, PostViewModel } from './posts.mapper';
import { PaginatedPostListDTO } from './dto/paginatedPostListDTO';
import { PaginationParameters } from '../common/types/PaginationParameters';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getById(postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return mapPostToViewModel(post);
  }

  async getPaginatedPostsList(dto: PaginatedPostListDTO, userId = null) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto;

    const count = await this.postModel.countDocuments({});
    const howManySkip = (pageNumber - 1) * pageSize;
    const posts = await this.postModel
      .find({})
      .sort({ [sortBy]: sortDirection })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    let items: PostViewModel[];
    if (userId) {
      //TODO похоже потом предстоит раскоментить.
      //
      // const postsIdList: Array<string> = posts.map((post) => post._id);
      // const userReactionsOnComments =
      //   await this.likesOfPostsRepository.getUserReactionOnPostsBunch(
      //     postsIdList,
      //     userId,
      //   );
      //
      // const postsIdAndReactionsList: any = [];
      // userReactionsOnComments.forEach((likeData) => {
      //   postsIdAndReactionsList[likeData.postId] = likeData.status;
      // });
      //
      // items = posts.map((post) => {
      //   const likeStatus =
      //     postsIdAndReactionsList[post._id] ||
      //     LikeOfComment.LIKE_STATUS_OPTIONS.NONE;
      //   return mapPostToViewModel(post, likeStatus);
      // });
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
    dto: PaginationParameters,
    userId = null,
  ) {
    await this.blogsQueryRepository.getById(blogId);
    const { sortBy, sortDirection, pageNumber, pageSize } = dto;

    const filter = { blogId: blogId };
    const count = await this.postModel.countDocuments(filter);
    const howManySkip = (pageNumber - 1) * pageSize;
    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(howManySkip)
      .limit(pageSize)
      .lean();

    let items: PostViewModel[];
    if (userId) {
      // TODO тут потом разобраться что делать код с большего годный но как нибудь вынести.
      //
      // const postsIdList: Array<string> = posts.map((post) => post._id);
      // const userReactionsOnComments =
      //   await this.likesOfPostsRepository.getUserReactionOnPostsBunch(
      //     postsIdList,
      //     userId,
      //   );
      //
      // const postsIdAndReactionsList: any = [];
      // userReactionsOnComments.forEach((likeData) => {
      //   postsIdAndReactionsList[likeData.postId] = likeData.status;
      // });
      //
      // items = posts.map((post) => {
      //   const likeStatus =
      //     postsIdAndReactionsList[post._id] ||
      //     LikeOfComment.LIKE_STATUS_OPTIONS.NONE;
      //   return mapPostToViewModel(post, likeStatus);
      // });
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
