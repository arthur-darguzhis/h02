import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { CreateQuestionCommand } from '../use-cases/create-question.use-case';
import { GetQuestionsListQuery } from './get-questions-list.query';

describe('Set publish status to quiz question', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let quizQuestionRepository: QuizQuestionRepository;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    quizQuestionRepository = given.configuredTestApp.get(
      QuizQuestionRepository,
    );

    /** Arrange
     * Given: There is 5 quiz questions
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetQuestionsListQuery(null, null, 'createdAt', 'asc', 10, 1),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].body).toBe('The first question body');
    expect(data.items[1].body).toBe('The second question body');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetQuestionsListQuery(null, null, 'createdAt', 'asc', 1, 2),
    );

    expect(data.page).toBe(2);
    expect(data.items.length).toBe(1);
    expect(data.items[0].body).toBe('The second question body');
  });

  async function prepareData() {
    await commandBus.execute(
      new CreateQuestionCommand('The first question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('The second question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('The third question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('The fourth question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );

    await commandBus.execute(
      new CreateQuestionCommand('The fifth question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );
  }
});
