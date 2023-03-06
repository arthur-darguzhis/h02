import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PaginatedPostListDto } from './dto/paginatedPostList.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { PaginatedCommentListDto } from '../comments/dto/paginatedCommentList.dto';
import { mapPostToViewModel } from './posts.mapper';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(@Query() dto: PaginatedPostListDto) {
    return await this.postsQueryRepository.getPaginatedPostsList(dto);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    try {
      return await this.postsQueryRepository.getById(id);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Post with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':postId/comments')
  async getCommentsRelatedToPost(
    @Param('postId') postId: string,
    @Query() paginatedCommentListDTO: PaginatedCommentListDto,
  ) {
    try {
      return await this.commentsQueryRepository.findByPostId(
        postId,
        paginatedCommentListDTO,
      );
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Post with id: ${postId} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async postPost(@Body() dto: CreatePostDto) {
    const post = await this.postsService.createPost(dto);
    return mapPostToViewModel(post);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    try {
      return await this.postsService.updatePost(id, dto);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Post with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    try {
      await this.postsService.deletePost(id);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Blog with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
