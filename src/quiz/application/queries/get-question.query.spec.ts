import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UnauthorizedActionException } from '../../../common/exceptions/domain.exceptions/unauthorized-action.exception';
import { CreateQuestionCommand } from '../use-cases/create-question.use-case';
import { GetQuestionQuery } from './get-question.query';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

describe('Blogger create new post', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let quizQuestion;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);

    /** Arrange
     * Given: There is a quiz question
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Throw error when try to get not exists question`, async () => {
    await expect(
      queryBus.execute(new GetQuestionQuery(UUID_THAT_IS_NOT_EXISTS)),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Quiz question with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`Admin create new quiz question.`, async () => {
    const questionView = await queryBus.execute(
      new GetQuestionQuery(quizQuestion.id),
    );

    expect(questionView).toEqual({
      id: quizQuestion.id,
      body: 'The first question body',
      correctAnswers: ['first, answer', 'second, answer', 'third, answer'],
      published: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  async function prepareData() {
    quizQuestion = await commandBus.execute(
      new CreateQuestionCommand('The first question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );
  }
});
