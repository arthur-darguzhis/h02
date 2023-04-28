import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

export class SetQuestionPublishStatusCommand {
  constructor(
    public readonly questionId: string,
    public readonly status: boolean,
  ) {}
}

@CommandHandler(SetQuestionPublishStatusCommand)
export class SetQuestionPublishStatusUseCase implements ICommandHandler {
  constructor(private quizQuestionRepository: QuizQuestionRepository) {}
  async execute(command: SetQuestionPublishStatusCommand) {
    const quizQuestion = await this.quizQuestionRepository.getById(
      command.questionId,
    );
    quizQuestion.published = command.status;
    quizQuestion.updatedAt = new Date();
    await this.quizQuestionRepository.save(quizQuestion);
  }
}
