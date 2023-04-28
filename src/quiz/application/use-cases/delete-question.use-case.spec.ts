import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './create-question.use-case';
import { UUID_THAT_IS_NOT_EXISTS } from '../../../testing/testing_consts';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { DeleteQuestionCommand } from './delete-question.use-case';
import { QuizQuestionRepository } from '../../infrastructure/quiz-question.repository';

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
      commandBus.execute(new DeleteQuestionCommand(UUID_THAT_IS_NOT_EXISTS)),
    ).rejects.toThrow(
      new EntityNotFoundException(
        `Quiz question with id: ${UUID_THAT_IS_NOT_EXISTS} is not found`,
      ),
    );
  });

  it(`Delete quiz question.`, async () => {
    await commandBus.execute(new DeleteQuestionCommand(quizQuestion.id));

    const question = await quizQuestionRepository.findById(quizQuestion.id);
    expect(question).toBeNull();
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
