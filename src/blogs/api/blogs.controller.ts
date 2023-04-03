import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationBlogListDto } from './dto/paginationBlogList.dto';
import { OptionalCurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetPostsListByBlogIdQuery } from '../../posts/application/query/get-posts-list-by-blog-id.query';
import { GetBlogsListQuery } from '../application/query/get-blogs-list.query';
import { GetBlogInfoQuery } from '../application/query/get-blog-info.query';
import { PaginationPostsByBlogIdDto } from './dto/paginationPostsByBlogId.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private queryBus: QueryBus) {}

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
}
