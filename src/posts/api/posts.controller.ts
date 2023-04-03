import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatedPostListDto } from './dto/paginatedPostList.dto';
import { PaginatedCommentListDto } from '../../comments/api/dto/paginated-comment-list.dto';
import { AddCommentToPostDto } from './dto/add-comment-to-post.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import {
  CurrentUserId,
  OptionalCurrentUserId,
} from '../../global-services/decorators/current-user-id.decorator';
import { CommentReactionsDto } from '../../comments/api/dto/comment-reactions.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserAddCommentCommand } from '../application/use-cases/user-add-comment.use-case';
import { GetPostsListQuery } from '../application/query/get-posts-list.query';
import { UserMakeReactionOnPostCommand } from '../application/use-cases/user-make-reaction-on-post.use-case';
import { GetPostQuery } from '../application/query/get-post.query';
import { GetCommentsListRelatedToPostQuery } from '../../comments/application/query/get-comments-list-related-to-post.query';
import { GetCommentQuery } from '../../comments/application/query/get-comment.query';

@Controller('posts')
export class PostsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get()
  async getPosts(
    @Query() dto: PaginatedPostListDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.queryBus.execute(
      new GetPostsListQuery(
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
        currentUserId,
      ),
    );
  }

  @Get(':postId')
  async getPost(
    @Param('postId') postId: string,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.queryBus.execute(new GetPostQuery(postId, currentUserId));
  }

  @Get(':postId/comments')
  async getCommentsRelatedToPost(
    @Param('postId') postId: string,
    @Query() dto: PaginatedCommentListDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return this.queryBus.execute(
      new GetCommentsListRelatedToPostQuery(
        postId,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
        currentUserId,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async addCommentToPost(
    @Param('postId') postId: string,
    @Body() dto: AddCommentToPostDto,
    @CurrentUserId() currentUserId,
  ) {
    const commentId = await this.commandBus.execute(
      new UserAddCommentCommand(dto.content, postId, currentUserId),
    );
    return await this.queryBus.execute(
      new GetCommentQuery(commentId, currentUserId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async processLikeStatus(
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() dto: CommentReactionsDto,
  ) {
    await this.commandBus.execute(
      new UserMakeReactionOnPostCommand(postId, currentUserId, dto.likeStatus),
    );
  }
}
