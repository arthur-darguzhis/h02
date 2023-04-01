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
import { CommentsService } from './comments.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUserId,
  OptionalCurrentUserId,
} from '../global-services/decorators/current-user-id.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentReactionsDto } from './dto/comment-reactions.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async getComment(
    @Param('id') id: string,
    @OptionalCurrentUserId() currentUserId,
  ) {
    return this.commentsQueryRepository.getByIdForCurrentUser(
      id,
      currentUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @CurrentUserId() currentUserId,
    @Body() dto: UpdateCommentDto,
  ) {
    await this.commentsService.updateCommentByOwner(id, currentUserId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async processLikeStatus(
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() dto: CommentReactionsDto,
  ) {
    await this.commentsService.addReaction(commentId, currentUserId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') id: string, @CurrentUserId() currentUserId) {
    await this.commentsService.deleteCommentByOwner(id, currentUserId);
  }
}
