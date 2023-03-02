import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';
import { mapUserToViewModel } from './user.mapper';
import { PaginatedUserListDTO } from './dto/paginatedUserListDTO';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsersList(@Query() dto: PaginatedUserListDTO) {
    return this.usersQueryRepository.getPaginatedUsersList(dto);
  }

  @Post()
  async postUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.usersService.addNewUserToSystem(dto);
      return mapUserToViewModel(user);
    } catch (e) {
      //TODO подумать как обрабатывать исключения в этой ситуации
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    try {
      await this.usersService.deleteUser(id);
    } catch (e) {
      throw new HttpException(
        //TODO может как то по другому можно поступить с исключениями, выкидывть где то глубоко а здесь перехватывать? хотя это не так гибко может быть.
        `User with id: ${id} is not exists`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
