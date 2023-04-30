import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameProgressRepository } from '../../infrastructure/game-progress.repository';
import { GameProgress } from '../entities/game-progress';
import { Game } from '../entities/game';
import { AnswerStatus } from '../../../common/pgTypes/enum/answerStatus';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';

export class SetAnswerCommand {
  constructor(
    public readonly currentUserId: string,
    public readonly answer: string,
  ) {}
}

@CommandHandler(SetAnswerCommand)
export class SetAnswerUseCase implements ICommandHandler {
  constructor(
    private gameRepository: GameRepository,
    private gameProgressRepository: GameProgressRepository,
    private quizQuestionRepository: QuizQuestionRepository,
  ) {}
  async execute(command: SetAnswerCommand) {
    const activeGame = await this.gameRepository.getActiveGameForUser(
      command.currentUserId,
    );
    const nextQuestion = await this.gameProgressRepository.getNextQuestion(
      activeGame.id,
      command.currentUserId,
    );

    nextQuestion.answer = command.answer;
    await this.setAnswerStatus(nextQuestion, command.answer);

    nextQuestion.answerDate = new Date();
    await this.gameProgressRepository.save(nextQuestion);
    const isCurrentUserFirstPlayer =
      activeGame.firstPlayerId === command.currentUserId;

    if (nextQuestion.answerStatus === AnswerStatus.Correct) {
      if (isCurrentUserFirstPlayer) {
        activeGame.firstPlayerScore += 1;
      } else {
        activeGame.secondPlayerScore += 1;
      }
    }
    await this.gameRepository.save(activeGame);

    const areAllQuestionsAnswered =
      await this.gameProgressRepository.areAllQuestionsAnswered(activeGame.id);

    if (areAllQuestionsAnswered) {
      await this.finishGame(activeGame, command.currentUserId);
    }

    return nextQuestion;
  }

  async setAnswerStatus(nextQuestion: GameProgress, answer): Promise<void> {
    const quizQuestion = await this.quizQuestionRepository.getById(
      nextQuestion.quizQuestionId,
    );

    if (quizQuestion.correctAnswers.includes(answer)) {
      nextQuestion.answerStatus = AnswerStatus.Correct;
    } else {
      nextQuestion.answerStatus = AnswerStatus.Incorrect;
    }
  }

  async finishGame(game: Game, lastAnswerSenderId: string) {
    game.finishGameDate = new Date();
    if (game.firstPlayerId === lastAnswerSenderId) {
      game.secondPlayerScore += game.secondPlayerScore > 0 ? 1 : 0;
    } else {
      game.firstPlayerScore += game.firstPlayerScore > 0 ? 1 : 0;
    }
    game.status = GameStatus.Finished;
    await this.gameRepository.save(game);
  }
}
