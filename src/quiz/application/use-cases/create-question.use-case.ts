import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsFactory } from '../../quiz-questions.factory';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { QuizQuestion } from '../entities/quiz-question';

export class CreateQuestionCommand {
  constructor(
    public readonly body: string,
    public readonly correctAnswers: string[],
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler {
  constructor(
    private questionsFactory: QuizQuestionsFactory,
    private quizQuestionsRepository: QuizQuestionRepository,
  ) {}
  async execute(command: CreateQuestionCommand): Promise<QuizQuestion> {
    const quizQuestion = this.questionsFactory.createQuizQuestion(command);
    return await this.quizQuestionsRepository.save(quizQuestion);
  }
}
