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
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminSetOwnerToOrphanBlogCommand } from '../application/use-cases/admin-set-owner-to-orphan-blog.use-case';
import { PaginationBlogListDto } from '../../../blogs/api/dto/paginationBlogList.dto';
import { AdminBanOrUnbanBlogCommand } from '../application/use-cases/admin-ban-or-unban-blog.use-case';
import { AdminBanOrUnbanBlogDto } from './dto/admin-ban-or-unban-blog.dto';
import { AdminCreateBlogCommand } from '../application/use-cases/admin-create-blog.use-case';
import { CreateBlogDto } from '../../../blogs/api/dto/createBlog.dto';
import { SuperAdminGetBlogsListQuery } from '../application/query/super-admin-get-blogs-list.query';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminCreateBlog(@Body() dto: CreateBlogDto) {
    await this.commandBus.execute(
      new AdminCreateBlogCommand(dto.name, dto.description, dto.websiteUrl),
    );
  }

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
    return await this.queryBus.execute(
      new SuperAdminGetBlogsListQuery(
        dto.searchNameTerm,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }
}
