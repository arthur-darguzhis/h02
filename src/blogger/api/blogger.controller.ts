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
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BloggerCreateBlogCommand } from '../application/use-cases/blogger-create-blog.use-case';
import { CreateBlogDto } from '../../blogs/api/dto/createBlog.dto';
import { CurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { PaginationBlogListDto } from '../../blogs/api/dto/paginationBlogList.dto';
import { BloggerUpdateBlogCommand } from '../application/use-cases/blogger-update-blog.use-case';
import { UpdateBlogDto } from '../../blogs/api/dto/updateBlog.dto';
import { BloggerDeleteBlogCommand } from '../application/use-cases/blogger-delete-blog.use-case';
import { BloggerCreatePostCommand } from '../application/use-cases/blogger-create-post.use-case';
import { CreatePostWithoutBlogIdDto } from '../../posts/api/dto/createPostWithoutBlogId.dto';
import { BloggerUpdatePostCommand } from '../application/use-cases/blogger-update-post.use-case';
import { UpdatePostWithoutBlogIdDto } from '../../posts/api/dto/updatePostWithoutBlogId.dto';
import { BloggerDeletePostCommand } from '../application/use-cases/blogger-delete-post.use-case';
import { BloggerBanUserDto } from './dto/blogger-ban-user.dto';
import { BloggerBanUserCommand } from '../application/use-cases/blogger-ban-user.use-case';
import { BannedUsersInBlog } from './dto/banned-users-in-blog.dto';
import { BloggerGetListOfBannedUsersInBlogQuery } from '../application/queries/blogger-get-list-of-banned-users-in-blog.query';
import { ReturnAllCommentsInCurrentUserBlogsDto } from './dto/return-all-comments-in-current-user-blogs.dto';
import { BloggerGetCommentsFromCurrentUserBlogsQuery } from '../application/queries/blogger-get-comments-from-current-user-blogs.query';
import { GetListOfBlogsByOwnerQuery } from '../application/queries/get-list-of-blogs-by-owner.query';
import { GetBlogInfoQuery } from '../../blogs/application/query/get-blog-info.query';
import { GetPostQuery } from '../../posts/application/query/get-post.query';

@Controller('blogger')
export class BloggerController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @UseGuards(JwtAuthGuard)
  @Post('blogs')
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const blogId = await this.commandBus.execute(
      new BloggerCreateBlogCommand(
        dto.name,
        dto.description,
        dto.websiteUrl,
        currentUserId,
      ),
    );

    return await this.queryBus.execute(new GetBlogInfoQuery(blogId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async getBlogs(
    @Query() dto: PaginationBlogListDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.queryBus.execute(
      new GetListOfBlogsByOwnerQuery(
        currentUserId,
        dto.searchNameTerm,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('blogs/:blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() dto: UpdateBlogDto,
    @Param('blogId') blogId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    await this.commandBus.execute(
      new BloggerUpdateBlogCommand(
        dto.name,
        dto.description,
        dto.websiteUrl,
        blogId,
        currentUserId,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blogs/:blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    await this.commandBus.execute(
      new BloggerDeleteBlogCommand(blogId, currentUserId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('blogs/:blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostWithoutBlogIdDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const postId = await this.commandBus.execute(
      new BloggerCreatePostCommand(
        dto.title,
        dto.shortDescription,
        dto.content,
        blogId,
        currentUserId,
      ),
    );

    return await this.queryBus.execute(new GetPostQuery(postId, currentUserId));
  }

  @UseGuards(JwtAuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostWithoutBlogIdDto,
    @CurrentUserId() currentUserId: string,
  ) {
    await this.commandBus.execute(
      new BloggerUpdatePostCommand(
        blogId,
        postId,
        currentUserId,
        dto.title,
        dto.shortDescription,
        dto.content,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    await this.commandBus.execute(
      new BloggerDeletePostCommand(blogId, postId, currentUserId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bloggerBanOrUnbanUserForBlog(
    @Param('userId') userId: string,
    @Body() dto: BloggerBanUserDto,
    @CurrentUserId() currentUserId: string,
  ) {
    await this.commandBus.execute(
      new BloggerBanUserCommand(
        currentUserId,
        dto.blogId,
        userId,
        dto.isBanned,
        dto.banReason,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:blogId')
  @HttpCode(HttpStatus.OK)
  async returnPaginatedListOfBannedUsersForBlog(
    @CurrentUserId() currentUserId: string,
    @Param('blogId') blogId: string,
    @Query() dto: BannedUsersInBlog,
  ) {
    return await this.queryBus.execute(
      new BloggerGetListOfBannedUsersInBlogQuery(
        blogId,
        currentUserId,
        dto.searchLoginTerm,
        dto.sortBy,
        dto.sortDirection,
        dto.pageNumber,
        dto.pageSize,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs/comments')
  @HttpCode(HttpStatus.OK)
  async returnAllCommentsForAllPostsInsideAllCurrentUserBlogs(
    @CurrentUserId() currentUserId: string,
    @Query() dto: ReturnAllCommentsInCurrentUserBlogsDto,
  ) {
    return await this.queryBus.execute(
      new BloggerGetCommentsFromCurrentUserBlogsQuery(
        currentUserId,
        dto.sortBy,
        dto.sortDirection,
        dto.pageNumber,
        dto.pageSize,
      ),
    );
  }
}
