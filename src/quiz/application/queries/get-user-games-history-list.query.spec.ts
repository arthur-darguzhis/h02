import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { AdminAddNewUserCommand } from '../../../super-admin/users/application/use-cases/admin-add-new-user.use-case';
import { Game } from '../entities/game';
import { SetAnswerCommand } from '../use-cases/set-answer.use-case';
import { CreateQuestionCommand } from '../use-cases/create-question.use-case';
import { SetGamePairCommand } from '../use-cases/pair-game-quiz.use-case';
import { GetUserGamesHistoryListQuery } from './get-user-games-history-list.query';
import { wait } from '../../../testing/wait';
import { GameStatus } from '../../../common/pgTypes/enum/gameStatus';

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
     * And: There are 4 games with status "Finish"
     * And: There is 1 game with status "Active"
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get games history for firstUser`, async () => {
    const data = await queryBus.execute(
      new GetUserGamesHistoryListQuery(firstUser.id),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].status).toBe(GameStatus.Active);
    expect(data.items[4].status).toBe(GameStatus.Finished);
  });

  it(`Check order`, async () => {
    const data = await queryBus.execute(
      new GetUserGamesHistoryListQuery(firstUser.id, 'pairCreatedDate', 'asc'),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].status).toBe(GameStatus.Finished);
    expect(data.items[4].status).toBe(GameStatus.Active);
  });

  it(`Check that pagination works`, async () => {
    const data = await queryBus.execute(
      new GetUserGamesHistoryListQuery(
        firstUser.id,
        'pairCreatedDate',
        'asc',
        2,
        3,
      ),
    );

    expect(data.items.length).toBe(1);
    expect(data.items[0].status).toBe(GameStatus.Active);
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

    //GAME 1
    const game1 = await commandBus.execute(
      new SetGamePairCommand(firstUser.id),
    );
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

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

    //GAME2
    await wait(100);
    const game2 = await commandBus.execute(
      new SetGamePairCommand(firstUser.id),
    );
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

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

    //GAME3
    await wait(100);
    const game3 = await commandBus.execute(
      new SetGamePairCommand(firstUser.id),
    );
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

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

    //GAME4
    await wait(100);
    const game4 = await commandBus.execute(
      new SetGamePairCommand(firstUser.id),
    );
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

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

    //GAME5 should be status "Active" because secondUser answered on 3 question and 2 left
    await wait(100);
    const game5 = await commandBus.execute(
      new SetGamePairCommand(firstUser.id),
    );
    await commandBus.execute(new SetGamePairCommand(secondUser.id));

    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(firstUser.id, 'incorrect'));

    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'correct1'));
    await commandBus.execute(new SetAnswerCommand(secondUser.id, 'incorrect'));
  }
});
