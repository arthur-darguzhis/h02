import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { Game } from '../entities/game';
import { GetResultOfAnswerQuery } from './get-result-of-answer.query';
import { GameProgress } from '../entities/game-progress';
import { AnswerStatus } from '../../../common/pgTypes/enum/answerStatus';
import { SetAnswerCommand } from '../use-cases/set-answer.use-case';
import { CreateQuestionCommand } from '../use-cases/create-question.use-case';
import { SetGamePairCommand } from '../use-cases/pair-game-quiz.use-case';

describe('Set publish status to quiz question', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let quizQuestionRepository: QuizQuestionRepository;

  let firstUser;
  let secondUser;
  let game: Game;

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
     * And: There is a game with 2 players
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Check response when answer is correct`, async () => {
    //Arrange
    const gameProgress: GameProgress = await commandBus.execute(
      new SetAnswerCommand(firstUser.id, 'correct1'),
    );

    //Act
    const answerInfo = await queryBus.execute(
      new GetResultOfAnswerQuery(gameProgress.id),
    );

    //Assert
    expect(answerInfo).toEqual({
      questionId: gameProgress.quizQuestionId,
      answerStatus: AnswerStatus.Correct,
      addedAt: expect.any(Date),
    });
  });

  it(`Check response when answer is incorrect`, async () => {
    //Arrange
    const gameProgress: GameProgress = await commandBus.execute(
      new SetAnswerCommand(firstUser.id, 'incorrect answer'),
    );

    //Act
    const answerInfo = await queryBus.execute(
      new GetResultOfAnswerQuery(gameProgress.id),
    );

    //Assert
    expect(answerInfo).toEqual({
      questionId: gameProgress.quizQuestionId,
      answerStatus: AnswerStatus.Incorrect,
      addedAt: expect.any(Date),
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
