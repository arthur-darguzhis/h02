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
import { UsersQueryRepository } from './users.query.repository';
import { mapUserToViewModel } from './user.mapper';
import { PaginatedUserListDto } from './dto/paginatedUserList.dto';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';
import { AddNewUserUseCase } from './use-cases/add-new-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';

// @UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private addNewUserUseCase: AddNewUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsersList(@Query() dto: PaginatedUserListDto) {
    return this.usersQueryRepository.getPaginatedUsersList(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.addNewUserUseCase.execute(dto);
    return mapUserToViewModel(user);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
  }
}
