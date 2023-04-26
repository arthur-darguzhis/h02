import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UserDeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UserDeleteCommentCommand)
export class UserDeleteCommentUseCase implements ICommandHandler {
  constructor(private commentsPgRepository: CommentsRepository) {}
  async execute(command: UserDeleteCommentCommand) {
    console.log(command);
    const comment = await this.commentsPgRepository.getById(command.commentId);

    if (comment.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized delete. This comment belongs to another user.',
      );
    }

    return await this.commentsPgRepository.delete(command.commentId);
  }
}
