import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersQueryRepository } from '../users.query.repository';
import { mapUserToViewModel } from '../user.mapper';
import { PaginatedUserListDto } from './dto/paginatedUserList.dto';
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic.auth.guard';
import { AddNewUserCommand } from '../application/use-cases/add-new-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPgRepository } from '../users.pg-repository';

// @UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private usersPgRepository: UsersPgRepository,
  ) {}

  @Get()
  async getUsersList(@Query() dto: PaginatedUserListDto) {
    return this.usersQueryRepository.getPaginatedUsersList(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.commandBus.execute(
      new AddNewUserCommand(dto.login, dto.password, dto.email),
    );
    return mapUserToViewModel(user);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
