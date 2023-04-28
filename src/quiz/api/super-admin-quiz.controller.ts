import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { BasicAuthGuard } from '../../auth/infrastructure/guards/basic.auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionCommand } from '../application/use-cases/create-question.use-case';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateQuestionCommand } from '../application/use-cases/update-question.use-case';
import { DeleteQuestionCommand } from '../application/use-cases/delete-question.use-case';
import { SetQuestionPublishStatusCommand } from '../application/use-cases/set-question-publish-status.use-case';
import { SetQuestionPublishStatusDto } from './dto/set-question-publish-status.dto';
import { GetQuestionsListDto } from './dto/get-questions-list.dto';
import { GetQuestionsListQuery } from '../application/queries/get-questions-list.query';
import { GetQuestionQuery } from '../application/queries/get-question.query';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class SuperAdminQuizController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  async postQuestion(@Body() dto: CreateQuestionDto) {
    const question = await this.commandBus.execute(
      new CreateQuestionCommand(dto.body, dto.correctAnswers),
    );

    return await this.queryBus.execute(new GetQuestionQuery(question.id));
  }

  @Put('questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    await this.commandBus.execute(
      new UpdateQuestionCommand(questionId, dto.body, dto.correctAnswers),
    );
  }

  @Delete('questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('questionId') questionId: string) {
    await this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }

  @Put('questions/:questionId/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPublishStatusQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: SetQuestionPublishStatusDto,
  ) {
    await this.commandBus.execute(
      new SetQuestionPublishStatusCommand(questionId, dto.published),
    );
  }

  @Get('questions')
  @HttpCode(HttpStatus.OK)
  async getQuestions(@Query() dto: GetQuestionsListDto) {
    return await this.queryBus.execute(
      new GetQuestionsListQuery(
        dto.bodySearchTerm,
        dto.publishedStatus,
        dto.sortBy,
        dto.sortDirection,
        dto.pageSize,
        dto.pageNumber,
      ),
    );
  }
}
