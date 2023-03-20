import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../auth/guards/basic.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { AdminSetOwnerToOrphanBlogCommand } from '../use-cases/admin-set-owner-to-orphan-blog.use-case';
import { BlogsQueryRepository } from '../../../blogs/blogs.query.repository';
import { PaginationBlogListDto } from '../../../blogs/dto/paginationBlogList.dto';

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
