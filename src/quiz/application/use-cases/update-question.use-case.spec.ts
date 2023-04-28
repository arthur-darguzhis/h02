import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './create-question.use-case';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';
import { UpdateQuestionCommand } from './update-question.use-case';

describe('Delete quiz question', () => {
  let given: Given;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let quizQuestionRepository: QuizQuestionRepository;

  let quizQuestion;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    quizQuestionRepository = given.configuredTestApp.get(
      QuizQuestionRepository,
    );

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
      commandBus.execute(
        new UpdateQuestionCommand(UUID_THAT_IS_NOT_EXISTS, 'new body', [
          'first',
          'second',
        ]),
      ),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Quiz question with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`Delete quiz question.`, async () => {
    await commandBus.execute(
      new UpdateQuestionCommand(quizQuestion.id, 'new body', [
        'first',
        'second',
      ]),
    );

    const question = await quizQuestionRepository.findById(quizQuestion.id);
    expect(question.body).toBe('new body');
    expect(question.correctAnswers).toEqual(['first', 'second']);
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
