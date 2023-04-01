import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  HttpCode,
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
import { CreatePostWithoutBlogIdDto } from '../posts/api/dto/createPostWithoutBlogId.dto';
import { PostsService } from '../posts/posts.service';
import { mapPostToViewModel } from '../posts/posts.mapper';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';
import { OptionalCurrentUserId } from '../global-services/decorators/current-user-id.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetPaginatedPostsListByBlogIdQuery } from '../posts/application/query/get-paginated-posts-list-by-blog-id.query';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(@Query() dto: PaginationBlogListDto) {
    return await this.blogsQueryRepository.getPaginatedBlogsList(dto);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return await this.blogsQueryRepository.getById(id);
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() dto: PaginationQueryParametersDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.queryBus.execute(
      new GetPaginatedPostsListByBlogIdQuery(
        blogId,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
        currentUserId,
      ),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() dto: CreateBlogDto) {
    const blog = await this.blogsService.adminCreateBlog(dto);
    return mapBlogToViewModel(blog);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostInBlog(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostWithoutBlogIdDto,
  ) {
    const post = await this.postsService.createPost({ ...dto, blogId });
    return mapPostToViewModel(post);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return await this.blogsService.updateBlog(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
