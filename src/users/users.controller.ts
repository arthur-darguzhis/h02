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
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';
import { mapUserToViewModel } from './user.mapper';
import { PaginatedUserListDto } from './dto/paginatedUserList.dto';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';

// @UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsersList(@Query() dto: PaginatedUserListDto) {
    console.log(dto);
    return this.usersQueryRepository.getPaginatedUsersList(dto);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async postUser(@Body() dto: CreateUserDto) {
    console.log(dto);
    const user = await this.usersService.addNewUserToSystem(dto);
    return mapUserToViewModel(user);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
