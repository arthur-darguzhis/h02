import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from './create-question.use-case';

describe('Blogger create new post', () => {
  let given: Given;
  let commandBus: CommandBus;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Admin create new quiz question with answers`, async () => {
    const quizQuestion = await commandBus.execute(
      new CreateQuestionCommand('The first question body', [
        'first, answer',
        'second, answer',
        'third, answer',
      ]),
    );
    expect(quizQuestion.id).not.toBeNull();
  });
});
