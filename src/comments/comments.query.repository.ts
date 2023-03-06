import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments-schema';
import { CommentViewModel, mapCommentToViewModel } from './comments.mapper';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PaginatedCommentListDTO } from './dto/paginatedCommentListDTO';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async getById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new Error('');
    //TODO здесь выкидывать исключение но какое свое или нестовское, если нестовское то проект привязывается к несту плюс там исключения для запросов
    return mapCommentToViewModel(comment);
  }

  async findByPostId(
    postId: string,
    dto: PaginatedCommentListDTO,
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
      //TODO с этим тоже что то делать надо
      //
      // const commentsIdList: Array<string> = comments.map(
      //   (comment) => comment._id,
      // );
      // const userReactionsOnComments =
      //   await this.likesOfCommentsRepository.getUserReactionOnCommentsBunch(
      //     commentsIdList,
      //     userId,
      //   );
      //
      // const commentIdAndReactionsList: any = [];
      // userReactionsOnComments.forEach((likeData) => {
      //   commentIdAndReactionsList[likeData.commentId] = likeData.status;
      // });
      //
      // items = comments.map((comment) => {
      //   const likeStatus =
      //     commentIdAndReactionsList[comment._id] ||
      //     LikeOfComment.LIKE_STATUS_OPTIONS.NONE;
      //   return mapCommentToViewModel(comment, likeStatus);
      // });
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
}
