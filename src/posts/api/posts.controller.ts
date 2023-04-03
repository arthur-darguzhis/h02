import {
  Body,
  Controller,
  Delete,
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
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostsService } from '../posts.service';
import { PostsQueryRepository } from '../posts.query.repository';
import { CommentsQueryRepository } from '../../comments/comments.query.repository';
import { PaginatedCommentListDto } from '../../comments/dto/paginated-comment-list.dto';
import { mapPostToViewModel } from '../posts.mapper';
import { AddCommentToPostDto } from './dto/add-comment-to-post.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import {
  CurrentUserId,
  OptionalCurrentUserId,
} from '../../global-services/decorators/current-user-id.decorator';
import { CommentsService } from '../../comments/comments.service';
import { mapCommentToViewModel } from '../../comments/comments.mapper';
import { CommentReactionsDto } from '../../comments/dto/comment-reactions.dto';
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic.auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserAddCommentCommand } from '../application/use-cases/user-add-comment.use-case';
import { GetPaginatedPostsListQuery } from '../application/query/get-paginated-posts-list';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query() dto: PaginatedPostListDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.queryBus.execute(
      new GetPaginatedPostsListQuery(
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
        currentUserId,
      ),
    );
  }

  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.postsQueryRepository.getByIdForCurrentUser(
      id,
      currentUserId,
    );
  }

  @Get(':postId/comments')
  async getCommentsRelatedToPost(
    @Param('postId') postId: string,
    @Query() paginatedCommentListDTO: PaginatedCommentListDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.commentsQueryRepository.findByPostId(
      postId,
      paginatedCommentListDTO,
      currentUserId,
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostDto) {
    const post = await this.postsService.createPost(dto);
    return mapPostToViewModel(post);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async addCommentToPost(
    @Param('postId') postId: string,
    @Body() dto: AddCommentToPostDto,
    @CurrentUserId() currentUserId,
  ) {
    const comment = await this.commandBus.execute(
      new UserAddCommentCommand(dto.content, postId, currentUserId),
    );
    return mapCommentToViewModel(comment);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return await this.postsService.updatePost(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async processLikeStatus(
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() dto: CommentReactionsDto,
  ) {
    await this.postsService.addReaction(postId, currentUserId, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    await this.postsService.deletePost(id);
  }
}
