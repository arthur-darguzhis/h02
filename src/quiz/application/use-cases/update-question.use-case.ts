import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

export class UpdateQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly body: string,
    public readonly correctAnswers: string[],
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler {
  constructor(private quizQuestionRepository: QuizQuestionRepository) {}
  async execute(command: UpdateQuestionCommand) {
    const quizQuestion = await this.quizQuestionRepository.getById(
      command.questionId,
    );

    quizQuestion.body = command.body;
    quizQuestion.correctAnswers = command.correctAnswers;
    quizQuestion.updatedAt = new Date();
    await this.quizQuestionRepository.save(quizQuestion);
  }
}
