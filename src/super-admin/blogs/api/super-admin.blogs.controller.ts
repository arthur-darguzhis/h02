import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { AdminSetOwnerToOrphanBlogCommand } from '../use-cases/admin-set-owner-to-orphan-blog.use-case';
import { BlogsQueryRepository } from '../../../blogs/blogs.query.repository';
import { PaginationBlogListDto } from '../../../blogs/dto/paginationBlogList.dto';
import { AdminBanOrUnbanBlogCommand } from '../use-cases/admin-ban-or-unban-blog.use-case';
import { AdminBanOrUnbanBlogDto } from './dto/admin-ban-or-unban-blog.dto';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async attachOrphanBlogToUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    await this.commandBus.execute(
      new AdminSetOwnerToOrphanBlogCommand(blogId, userId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banOrUnbanBlog(
    @Param('blogId') blogId: string,
    @Body() dto: AdminBanOrUnbanBlogDto,
  ) {
    return await this.commandBus.execute(
      new AdminBanOrUnbanBlogCommand(blogId, dto.isBanned),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getPaginatedBlogsListWithOwnerInfo(
    @Query() dto: PaginationBlogListDto,
  ) {
    return await this.blogsQueryRepository.getPaginatedBlogsListWithOwnerInfo(
      dto,
    );
  }
}
