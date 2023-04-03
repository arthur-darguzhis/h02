import { Given } from '../../../../test/xxx/testEntities/Given';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AdminAddNewUserCommand } from '../use-cases/admin-add-new-user.use-case';
import { UsersPgRepository } from '../../../users/infrastructure/users.pg-repository';
import { AdminBanOrUnbanUserCommand } from '../use-cases/admin-ban-or-unban-user.use-case';
import { GetUsersListQuery } from './get-users-list.query';

describe('Should return list of banned users in a blog', () => {
  let given: Given;
  let usersPgRepository: UsersPgRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  let reader1;
  let reader2;
  let reader3;
  let reader4;
  let reader5;

  beforeEach(async () => {
    given = await Given.bootstrapTestApp();
    await given.clearDb();
    commandBus = given.configuredTestApp.get(CommandBus);
    queryBus = given.configuredTestApp.get(QueryBus);
    usersPgRepository = given.configuredTestApp.get(UsersPgRepository);

    /** Arrange
     * Given: There is a user as blogger with login "blogger";
     * And: There are 10 users (users 1-5 are banned) users 6-10 are not banned
     */
    await prepareData();
  });

  afterEach(async () => {
    await given.closeApp();
  });

  it(`Get all users list without any filter settings`, async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('all', null, null, 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(10);
    expect(data.items[0].login).toBe('reader10');
    expect(data.items[9].login).toBe('reader1');
  });

  it(`Get all users list that are banned`, async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('banned', null, null, 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].login).toBe('reader5');
    expect(data.items[4].login).toBe('reader1');
  });

  it(`Get all users list that are not banned`, async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery(
        'notBanned',
        null,
        null,
        'createdAt',
        'desc',
        10,
        1,
      ),
    );

    expect(data.items.length).toBe(5);
    expect(data.items[0].login).toBe('reader10');
    expect(data.items[4].login).toBe('reader6');
  });

  it(`Get users list where "searchLoginTerm = reader1"`, async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('all', 'reader1', null, 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(2);
    expect(data.items[0].login).toBe('reader10');
    expect(data.items[1].login).toBe('reader1');
  });

  it(`Get users list where "searchEmailTerm = reader1"`, async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('all', null, 'reader1', 'createdAt', 'desc', 10, 1),
    );

    expect(data.items.length).toBe(2);
    expect(data.items[0].login).toBe('reader10');
    expect(data.items[1].login).toBe('reader1');
  });

  it('Check order', async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('all', null, null, 'createdAt', 'asc', 10, 1),
    );

    expect(data.items.length).toBe(10);
    expect(data.items[0].login).toBe('reader1');
    expect(data.items[9].login).toBe('reader10');
  });

  it('Check that pagination works', async () => {
    const data = await queryBus.execute(
      new GetUsersListQuery('all', null, null, 'createdAt', 'asc', 2, 4),
    );

    expect(data.items.length).toBe(2);
    expect(data.items[0].login).toBe('reader7');
    expect(data.items[1].login).toBe('reader8');
  });

  async function prepareData() {
    await commandBus.execute(
      new AdminAddNewUserCommand('reader1', '123456', 'reader1@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader2', '123456', 'reader2@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader3', '123456', 'reader3@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader4', '123456', 'reader4@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader5', '123456', 'reader5@test.test'),
    );

    reader1 = await usersPgRepository.findByLogin('reader1');
    reader2 = await usersPgRepository.findByLogin('reader2');
    reader3 = await usersPgRepository.findByLogin('reader3');
    reader4 = await usersPgRepository.findByLogin('reader4');
    reader5 = await usersPgRepository.findByLogin('reader5');

    await commandBus.execute(
      new AdminAddNewUserCommand('reader6', '123456', 'reader6@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader7', '123456', 'reader7@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader8', '123456', 'reader8@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader9', '123456', 'reader9@test.test'),
    );

    await commandBus.execute(
      new AdminAddNewUserCommand('reader10', '123456', 'reader10@test.test'),
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(reader1.id, true, 'abuse behaviour'),
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(reader2.id, true, 'abuse behaviour'),
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(reader3.id, true, 'abuse behaviour'),
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(reader4.id, true, 'abuse behaviour'),
    );

    await commandBus.execute(
      new AdminBanOrUnbanUserCommand(reader5.id, true, 'abuse behaviour'),
    );
  }
});
