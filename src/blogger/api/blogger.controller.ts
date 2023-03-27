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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { BloggerCreateBlogCommand } from '../application/use-cases/blogger-create-blog.use-case';
import { mapBlogToViewModel } from '../../blogs/blog.mapper';
import { CreateBlogDto } from '../../blogs/dto/createBlog.dto';
import { CurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { PaginationBlogListDto } from '../../blogs/dto/paginationBlogList.dto';
import { BlogsQueryRepository } from '../../blogs/blogs.query.repository';
import { BloggerUpdateBlogCommand } from '../application/use-cases/blogger-update-blog.use-case';
import { UpdateBlogDto } from '../../blogs/dto/updateBlog.dto';
import { BloggerDeleteBlogCommand } from '../application/use-cases/blogger-delete-blog.use-case';
import { BloggerCreatePostCommand } from '../application/use-cases/blogger-create-post';
import { CreatePostWithoutBlogIdDto } from '../../posts/dto/createPostWithoutBlogId.dto';
import { mapPostToViewModel } from '../../posts/posts.mapper';
import { BloggerUpdatePostCommand } from '../application/use-cases/blogger-update-post';
import { UpdatePostWithoutBlogIdDto } from '../../posts/dto/updatePostWithoutBlogId.dto';
import { BloggerDeletePostCommand } from '../application/use-cases/blogger-delete-post.use-case';
import { BloggerBanUserDto } from './dto/blogger-ban-user.dto';
import { BloggerBanUserCommand } from '../application/use-cases/blogger-ban-user.use-case';

@Controller('blogger')
export class BloggerController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('blogs')
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() currentUserId: string,
  ) {
    const blog = await this.commandBus.execute(
      new BloggerCreateBlogCommand(
        dto.name,
        dto.description,
        dto.websiteUrl,
        currentUserId,
      ),
    );
    return mapBlogToViewModel(blog);
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async getBlogs(
    @Query() dto: PaginationBlogListDto,
    @CurrentUserId() currentUserId: string,
  ) {
    return await this.blogsQueryRepository.getPaginatedBlogsListByOwner(
      dto,
      currentUserId,
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
      new BloggerUpdateBlogCommand(dto, blogId, currentUserId),
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
    const post = await this.commandBus.execute(
      new BloggerCreatePostCommand(
        dto.title,
        dto.shortDescription,
        dto.content,
        blogId,
        currentUserId,
      ),
    );
    return mapPostToViewModel(post);
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
      new BloggerUpdatePostCommand(blogId, postId, currentUserId, dto),
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
}
