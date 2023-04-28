import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

export class DeleteQuestionCommand {
  constructor(public readonly questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler {
  constructor(private quizQuestionRepository: QuizQuestionRepository) {}
  async execute(command: DeleteQuestionCommand) {
    console.log(command);
    const question = await this.quizQuestionRepository.getById(
      command.questionId,
    );
    await this.quizQuestionRepository.delete(question);
  }
}
