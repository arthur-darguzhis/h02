import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameProgressRepository } from '../../infrastructure/game-progress.repository';
import { GameProgress } from '../entities/game-progress';
import { Game } from '../entities/game';
import { AnswerStatus } from '../../../common/pgTypes/enum/answerStatus';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';
import { GamePlayerStatistic } from '../entities/game-players-statistic';
import { GameResult } from '../../../common/pgTypes/enum/gameResult';
import { GamePlayersStatisticRepository } from '../../infrastructure/game-players-statistic.repository';

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
    private gamePlayersStatisticRepository: GamePlayersStatisticRepository,
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

    const howManyQuestionsLeft =
      await this.gameProgressRepository.getCountNotAnsweredQuestions(
        activeGame.id,
        command.currentUserId,
      );

    if (howManyQuestionsLeft === 0) {
      setTimeout(async () => {
        const opponentId = isCurrentUserFirstPlayer
          ? activeGame.secondPlayerId
          : activeGame.firstPlayerId;
        const gameAfter10sec = await this.gameRepository.findById(
          activeGame.id,
        );
        if (gameAfter10sec.finishGameDate !== null) {
          return;
        }
        await this.gameProgressRepository.abortNotAnsweredQuestions(
          activeGame.id,
          opponentId,
        );

        this.finishGame(gameAfter10sec, opponentId);
      }, 10000);
    }

    const bothPlayersAnsweredAllQuestions =
      await this.gameProgressRepository.areAllQuestionsAnswered(activeGame.id);

    if (bothPlayersAnsweredAllQuestions) {
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
    await this.addStatistic(game);
  }

  async addStatistic(game: Game) {
    const firstPlayerStatistic = new GamePlayerStatistic();
    firstPlayerStatistic.gameId = game.id;
    firstPlayerStatistic.userId = game.firstPlayerId;
    firstPlayerStatistic.score = game.firstPlayerScore;

    const secondPlayerStatistic = new GamePlayerStatistic();
    secondPlayerStatistic.gameId = game.id;
    secondPlayerStatistic.userId = game.secondPlayerId;
    secondPlayerStatistic.score = game.secondPlayerScore;

    if (firstPlayerStatistic.score === secondPlayerStatistic.score) {
      firstPlayerStatistic.result = GameResult.Draw;
      secondPlayerStatistic.result = GameResult.Draw;
    }

    if (firstPlayerStatistic.score < secondPlayerStatistic.score) {
      firstPlayerStatistic.result = GameResult.Lose;
      secondPlayerStatistic.result = GameResult.Win;
    }

    if (firstPlayerStatistic.score > secondPlayerStatistic.score) {
      firstPlayerStatistic.result = GameResult.Win;
      secondPlayerStatistic.result = GameResult.Lose;
    }

    await this.gamePlayersStatisticRepository.save(firstPlayerStatistic);
    await this.gamePlayersStatisticRepository.save(secondPlayerStatistic);
  }
}
