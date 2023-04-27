import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EntityAlreadyExistsException } from '../../common/exceptions/domain.exceptions/entity-already-exists.exception';
import { UnprocessableEntityException } from '../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { User } from '../application/entities/user';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByLogin(login: string): Promise<User | null> {
    return await this.usersRepository.findOneBy([{ login: login }]);
  }

  async throwIfEmailInUse(email: string): Promise<void | never> {
    const user = await this.usersRepository.findOneBy([{ email: email }]);
    if (user !== null) {
      throw new EntityAlreadyExistsException(
        `User with email: ${email} already exists`,
        'email',
      );
    }
  }

  async throwIfLoginInUse(login: string): Promise<void | never> {
    const user = await this.usersRepository.findOneBy([{ login: login }]);
    if (user !== null) {
      throw new EntityAlreadyExistsException(
        `User with login: ${login} already exists`,
        'login',
      );
    }
  }

  async getByConfirmationCode(confirmationCode): Promise<User | never> {
    const user = await this.usersRepository.findOneBy([
      { confirmationCode: confirmationCode },
    ]);

    if (user === null) {
      throw new UnprocessableEntityException(
        `User with confirmationCode: "${confirmationCode}" is not found`,
      );
    }

    return user;
  }

  async getByEmail(email: string): Promise<User | never> {
    const user = await this.usersRepository.findOneBy([{ email: email }]);

    if (user === null) {
      throw new EntityNotFoundException(
        `User with email: ${email} is not found`,
        'email',
      );
    }

    return user;
  }

  async save(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

  //TODO заменить этот кусочек кода.
  async forTest_resetExpirationDateOfConfirmationCodeToCurrentDate(
    userId: string,
  ) {
    await this.dataSource.query(
      'UPDATE users SET expiration_date_of_confirmation_code = $1 WHERE id = $2',
      [new Date(), userId],
    );
  }

  async getById(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (user === null) {
      throw new EntityNotFoundException(
        `User with id: "${userId}" does not exist`,
      );
    }
    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.login = :loginOrEmail', { loginOrEmail })
      .orWhere('user.email = :loginOrEmail', { loginOrEmail })
      .getOne();

    if (user === null) {
      throw new EntityNotFoundException(
        `User with email or login "${loginOrEmail}" does not exist`,
      );
    }

    return user;
  }

  async delete(user: User) {
    await this.usersRepository.remove(user);
  }

  async throwIfUserIsNotExists(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (user === null) {
      throw new EntityNotFoundException(
        `User with id: ${userId} is not exists`,
        'login',
      );
    }
  }

  async banUnbanUser(
    userId: string,
    isBanned: boolean,
    banDate: Date | boolean,
    banReason: string,
  ) {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ isBanned, banDate, banReason })
      .where('id = :id', { id: userId })
      .execute();
  }
}
