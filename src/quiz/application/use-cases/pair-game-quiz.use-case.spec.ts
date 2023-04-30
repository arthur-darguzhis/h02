import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './create-question.use-case';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { SetGamePairCommand } from './pair-game-quiz.use-case';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { GetGamePairQuizQuery } from '../queries/get-game-pair-quiz.query';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';

describe('Set publish status to quiz question', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let quizQuestionRepository: QuizQuestionRepository;

  let firstUser;
  let secondUser;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    quizQuestionRepository = given.configuredTestApp.get(
      QuizQuestionRepository,
    );

    /** Arrange
     * Given: There are 10 quiz questions
     * And: There are 2 users
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Create pair with current user as first player`, async () => {
    //Act
    const game = await commandBus.execute(new SetGamePairCommand(firstUser.id));

    //Assert
    const gameData = await queryBus.execute(
      new GetGamePairQuizQuery(firstUser.id, game.id),
    );
    expect(gameData).toEqual({
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: firstUser.id,
          login: 'firstUser',
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: GameStatus.PendingSecondPlayer,
      pairCreatedDate: expect.any(Date),
      startGameDate: null,
      finishGameDate: null,
    });
  });

  it(`Throw error if user already in game with "Pending" status`, async () => {
    await commandBus.execute(new SetGamePairCommand(firstUser.id));
    await expect(
      commandBus.execute(new SetGamePairCommand(firstUser.id)),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Current user is already participating in active pair',
      ),
    );
  });

  it(`Throw error if user is already participating in game with "Active" status`, async () => {
    await commandBus.execute(new SetGamePairCommand(firstUser.id));
    await commandBus.execute(new SetGamePairCommand(secondUser.id));
    await expect(
      commandBus.execute(new SetGamePairCommand(firstUser.id)),
    ).rejects.toThrow(
      new UnauthorizedActionException(
        'Current user is already participating in active pair',
      ),
    );
  });

  it(`Create pair with current user as second player`, async () => {
    const game = await commandBus.execute(new SetGamePairCommand(firstUser.id));
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

    //Assert
    const gameData = await queryBus.execute(
      new GetGamePairQuizQuery(firstUser.id, game.id),
    );

    expect(gameData).toEqual({
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: firstUser.id,
          login: 'firstUser',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: secondUser.id,
          login: 'secondUser',
        },
        score: 0,
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
      status: GameStatus.Active,
      pairCreatedDate: expect.any(Date),
      startGameDate: expect.any(Date),
      finishGameDate: null,
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
  }
});
