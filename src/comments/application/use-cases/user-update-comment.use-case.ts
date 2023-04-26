import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class UserUpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}

@CommandHandler(UserUpdateCommentCommand)
export class UserUpdateCommentUseCase implements ICommandHandler {
  constructor(private commentsPgRepository: CommentsRepository) {}

  async execute(command: UserUpdateCommentCommand) {
    console.log(command);
    const comment = await this.commentsPgRepository.getById(command.commentId);

    if (comment.userId !== command.userId) {
      throw new UnauthorizedActionException(
        'Unauthorized updating. This comment belongs to another user.',
      );
    }

    comment.content = command.content;
    await this.commentsPgRepository.update(comment);
  }
}
