import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { Game } from '../entities/game';
import { SetAnswerCommand } from './set-answer.use-case';
import { CreateQuestionCommand } from './create-question.use-case';
import { SetGamePairCommand } from './pair-game-quiz.use-case';
import { GetGamePairQuizQuery } from '../queries/get-game-pair-quiz.query';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';
import { wait } from '../../../testing/wait';
import { GameRepository } from '../../infrastructure/game.repository';

describe('Set publish status to quiz question', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let quizQuestionRepository: QuizQuestionRepository;
  let gameRepository: GameRepository;

  let firstUser;
  let secondUser;
  let game: Game;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    gameRepository = given.configuredTestApp.get(GameRepository);
    quizQuestionRepository = given.configuredTestApp.get(
      QuizQuestionRepository,
    );

    /** Arrange
     * Given: There are 10 quiz questions
     * And: There are 2 users
     * And: There is a game with 2 players
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Check scenario when one of the players answered all questions 
  the second player has only 10 seconds for answering
  after that all not answered question will be marked as incorrect
  and the game will be finished`, async () => {
    //Arrange
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));

    await wait(12000);
    const updatedGame = await gameRepository.findById(game.id);
    expect(updatedGame.firstPlayerScore).toBe(3);
    expect(updatedGame.secondPlayerScore).toBe(0);
    expect(updatedGame.finishGameDate).not.toBeNull();
  }, 20000);

  it(`Play game to have result 2+1:3 (2 correct answer and +1 bonus ball because firstPlayer finished early)`, async () => {
    //Arrange
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));

    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));

    //Act
    const gameResult = await queryBus.execute(
      new GetGamePairQuizQuery(firstUser.id, game.id),
    );

    //Assert
    expect(gameResult).toEqual({
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
        ],
        player: {
          id: firstUser.id,
          login: 'firstUser',
        },
        score: 3,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
        ],
        player: {
          id: secondUser.id,
          login: 'secondUser',
        },
        score: 3,
      },
      questions: [
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
      ],
      status: GameStatus.Finished,
      pairCreatedDate: expect.any(Date),
      startGameDate: expect.any(Date),
      finishGameDate: expect.any(Date),
    });
  });

  it(`Play game to have result 0+1 (the first user user do not have a bonus because do not have correct answers, second user do not have bonuses because finished last`, async () => {
    //Arrange
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));

    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));

    //Act
    const gameResult = await queryBus.execute(
      new GetGamePairQuizQuery(firstUser.id, game.id),
    );

    //Assert
    expect(gameResult).toEqual({
      id: game.id,
      firstPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
        ],
        player: {
          id: firstUser.id,
          login: 'firstUser',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Correct',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
          {
            questionId: expect.any(String),
            answerStatus: 'Incorrect',
            addedAt: expect.any(Date),
          },
        ],
        player: {
          id: secondUser.id,
          login: 'secondUser',
        },
        score: 1,
      },
      questions: [
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
        {
          id: expect.any(String),
          body: expect.any(String),
        },
      ],
      status: GameStatus.Finished,
      pairCreatedDate: expect.any(Date),
      startGameDate: expect.any(Date),
      finishGameDate: expect.any(Date),
    });
  });

  async function prepareData() {
    await commandBus.execute(
      new CreateQuestionCommand('1 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('2 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('3 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('4 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('5 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('6 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('7 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('8 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('9 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('10 question body', [
        'correct1',
        'correct2',
        'correct3',
      ]),
    );

    firstUser = await commandBus.execute(
      new AdminAddNewUserCommand('firstUser', '123456', 'firstUser@test.test'),
    );

    secondUser = await commandBus.execute(
      new AdminAddNewUserCommand(
        'secondUser',
        '123456',
        'secondUser@test.test',
      ),
    );

    game = await commandBus.execute(new SetGamePairCommand(firstUser.id));
    await commandBus.execute(new SetGamePairCommand(secondUser.id));
  }
});
