import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsService } from '../blogs.service';
import { BlogsQueryRepository } from '../blogs.query.repository';
import { PaginationBlogListDto } from './dto/paginationBlogList.dto';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { PaginationQueryParametersDto } from '../../common/dto/PaginationQueryParametersDto';
import { PostsService } from '../../posts/posts.service';
import { OptionalCurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostsListByBlogIdQuery } from '../../posts/application/query/get-posts-list-by-blog-id.query';
import { GetBlogsListQuery } from '../application/query/get-blogs-list.query';
import { GetBlogInfoQuery } from '../application/query/get-blog-info.query';
import { PaginationPostsByBlogIdDto } from './dto/paginationPostsByBlogId.dto';

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
    return await this.queryBus.execute(
      new GetBlogsListQuery(
        dto.searchNameTerm,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return await this.queryBus.execute(new GetBlogInfoQuery(id));
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId') blogId: string,
    @Query() dto: PaginationPostsByBlogIdDto,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return await this.queryBus.execute(
      new GetPostsListByBlogIdQuery(
        blogId,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
        currentUserId,
      ),
    );
  }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async putBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
  //   return await this.blogsService.updateBlog(id, dto);
  // }
  //
  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteBlog(@Param('id') id: string) {
  //   await this.blogsService.deleteBlog(id);
  // }
}
