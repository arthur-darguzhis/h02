import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic.auth.guard';
import { AdminBanOrUnbanUserDto } from './api/dto/admin-ban-or-unban-user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { AdminBanOrUnbanUserCommand } from './use-cases/admin-ban-or-unban-user.use-case';

@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Put(':userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminBanOrUnbanUser(
    @Param('userId') userId: string,
    @Body() dto: AdminBanOrUnbanUserDto,
  ) {
    await this.commandBus.execute(new AdminBanOrUnbanUserCommand(userId, dto));
  }
}
