import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameProgressRepository } from '../../infrastructure/game-progress.repository';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';
import { Game } from '../entities/game';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { GameProgress } from '../entities/game-progress';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';

export class SetGamePairCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(SetGamePairCommand)
export class PairGameQuizUseCase implements ICommandHandler {
  constructor(
    private quizQuestionRepository: QuizQuestionRepository,
    private gameProgressRepository: GameProgressRepository,
    private gameRepository: GameRepository,
  ) {}

  async execute(command: SetGamePairCommand) {
    const activeGame = await this.gameRepository.findActiveGameForUser(
      command.userId,
    );
    if (activeGame !== null) {
      console.log('activeGame:: ' + activeGame.status);
      throw new UnauthorizedActionException(
        `Current user is already participating in active pair`,
      );
    }
    const openedGame = await this.gameRepository.findOpenedGame();

    if (!openedGame) {
      const game = new Game();
      game.status = GameStatus.PendingSecondPlayer;
      game.firstPlayerId = command.userId;
      game.pairCreatedDate = new Date();

      return await this.gameRepository.save(game);
    }

    if (openedGame.firstPlayerId === command.userId) {
      throw new UnauthorizedActionException(
        'Current user is already participating in active pair',
      );
    }

    openedGame.status = GameStatus.Active;
    openedGame.secondPlayerId = command.userId;
    openedGame.startGameDate = new Date();
    await this.gameRepository.save(openedGame);
    await this.addQuestionsToGame(
      openedGame.id,
      openedGame.firstPlayerId,
      openedGame.secondPlayerId,
    );
    return openedGame;
  }

  private async addQuestionsToGame(
    gameId: string,
    firstPlayerId: string,
    secondPlayerId: string,
    questionsCount = 5,
  ) {
    const questionsIdList = await this.quizQuestionRepository.getListOfId(
      questionsCount,
    );

    await this.createGameProgress(questionsIdList, gameId, firstPlayerId);
    await this.createGameProgress(questionsIdList, gameId, secondPlayerId);
  }

  private async createGameProgress(questionsIdList, gameId, playerId) {
    const questions = [];
    let questionNumber = 1;
    questionsIdList.forEach((question) => {
      const gameProgress = new GameProgress();
      gameProgress.gameId = gameId;
      gameProgress.quizQuestionId = question.id;
      gameProgress.questionNumber = questionNumber;
      gameProgress.userId = playerId;
      questions.push(gameProgress);
      questionNumber++;
    });

    if (questions.length > 0) {
      await this.gameProgressRepository.saveMany(questions);
    }
  }
}
