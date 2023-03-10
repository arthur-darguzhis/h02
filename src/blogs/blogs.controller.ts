import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryRepository } from './blogs.query.repository';
import { CreateBlogDto } from './dto/createBlog.dto';
import { mapBlogToViewModel } from './blog.mapper';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { PaginationBlogListDto } from './dto/paginationBlogList.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PaginationQueryParametersDto } from '../common/dto/PaginationQueryParametersDto';
import { CreatePostWithoutBlogIdDto } from '../posts/dto/createPostWithoutBlogId.dto';
import { PostsService } from '../posts/posts.service';
import { mapPostToViewModel } from '../posts/posts.mapper';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(@Query() dto: PaginationBlogListDto) {
    return await this.blogsQueryRepository.getPaginatedBlogsList(dto);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    try {
      return await this.blogsQueryRepository.getById(id);
    } catch (e) {
      //TODO подумать как обрабатывать исключения в этой ситуации
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Blog with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() dto: PaginationQueryParametersDto,
  ) {
    try {
      return await this.postsQueryRepository.getPaginatedPostsListByBlogId(
        blogId,
        dto,
      );
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Blog with id: ${blogId} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(@Body() dto: CreateBlogDto) {
    try {
      const blog = await this.blogsService.createBlog(dto);
      return mapBlogToViewModel(blog);
    } catch (e) {
      console.log(e.message);
      //TODO подумать как обрабатывать исключения в этой ситуации
    }
  }

  @Post(':blogId/posts')
  async createPostInBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostWithoutBlogIdDto,
  ) {
    const post = await this.postsService.createPost({ ...dto, blogId });
    return mapPostToViewModel(post);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    try {
      return await this.blogsService.updateBlog(id, dto);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Blog with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    try {
      await this.blogsService.deleteBlog(id);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `Blog with id: ${id} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
