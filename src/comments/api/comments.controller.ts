import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import {
  CurrentUserId,
  OptionalCurrentUserId,
} from '../../global-services/decorators/current-user-id.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactionsDto } from './dto/comment-reactions.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserDeleteCommentCommand } from '../application/use-cases/user-delete-comment.use-case';
import { UserUpdateCommentCommand } from '../application/use-cases/user-update-comment.use-case';
import { UserMakeReactionOnCommentCommand } from '../application/use-cases/user-make-reaction-on-comment.use-case';
import { GetCommentQuery } from '../application/query/get-comment.query';

@Controller('comments')
export class CommentsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get(':commentId')
  async getComment(
    @Param('commentId') commentId: string,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return this.queryBus.execute(new GetCommentQuery(commentId, currentUserId));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId,
    @Body() dto: UpdateCommentDto,
  ) {
    await this.commandBus.execute(
      new UserUpdateCommentCommand(commentId, currentUserId, dto.content),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async processLikeStatus(
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() dto: CommentReactionsDto,
  ) {
    return await this.commandBus.execute(
      new UserMakeReactionOnCommentCommand(
        commentId,
        currentUserId,
        dto.likeStatus,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') id: string, @CurrentUserId() currentUserId) {
    await this.commandBus.execute(
      new UserDeleteCommentCommand(id, currentUserId),
    );
  }
}
