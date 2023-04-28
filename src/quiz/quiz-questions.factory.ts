import { CreateQuestionCommand } from './application/use-cases/create-question.use-case';
import { QuizQuestion } from './application/entities/quiz-question';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizQuestionsFactory {
  createQuizQuestion(command: CreateQuestionCommand) {
    const date = new Date();
    const quizQuestion = new QuizQuestion();
    quizQuestion.body = command.body;
    quizQuestion.correctAnswers = command.correctAnswers;
    quizQuestion.published = false;
    quizQuestion.createdAt = date;
    quizQuestion.updatedAt = null;
    return quizQuestion;
  }
}
