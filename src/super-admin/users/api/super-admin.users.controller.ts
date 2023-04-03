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
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { AdminBanOrUnbanUserDto } from './dto/admin-ban-or-unban-user.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminBanOrUnbanUserCommand } from '../application/use-cases/admin-ban-or-unban-user.use-case';
import { PaginatedUserListDto } from '../../../users/api/dto/paginatedUserList.dto';
import { CreateUserDto } from '../../../users/api/dto/createUser.dto';
import { AdminAddNewUserCommand } from '../application/use-cases/admin-add-new-user.use-case';
import { AdminDeleteUserByIdCommand } from '../application/use-cases/admin-delete-user-by-id.use-case';
import { AdminGetUserDataByEmailQuery } from '../application/query/admin-get-user-data-by-email.query';
import { GetUsersListQuery } from '../application/query/get-users-list.query';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Put(':userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminBanOrUnbanUser(
    @Param('userId') userId: string,
    @Body() dto: AdminBanOrUnbanUserDto,
  ) {
    return await this.commandBus.execute(
      new AdminBanOrUnbanUserCommand(userId, dto.isBanned, dto.banReason),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPaginatedUserList(@Query() dto: PaginatedUserListDto) {
    return await this.queryBus.execute(
      new GetUsersListQuery(
        dto.banStatus,
        dto.searchLoginTerm,
        dto.searchEmailTerm,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async adminAddNewUser(@Body() dto: CreateUserDto) {
    await this.commandBus.execute(
      new AdminAddNewUserCommand(dto.login, dto.password, dto.email),
    );

    return await this.queryBus.execute(
      new AdminGetUserDataByEmailQuery(dto.email),
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminDeleteUser(@Param('userId') userId: string) {
    await this.commandBus.execute(new AdminDeleteUserByIdCommand(userId));
  }
}
