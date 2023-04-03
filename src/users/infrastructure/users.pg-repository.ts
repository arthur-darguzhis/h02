import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityAlreadyExistsException } from '../../common/exceptions/domain.exceptions/entity-already-exists.exception';
import { UnprocessableEntityException } from '../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';

@Injectable()
export class UsersPgRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findByLogin(login: string) {
    const result = await this.dataSource.query(
      `SELECT id,
               login,
               email,
               password_hash                        as "passwordHash",
               created_at                           as "createdAt",
               confirmation_code                    as "confirmationCode",
               expiration_date_of_confirmation_code as "expirationDate",
               is_confirmed                         as "isConfirmed",
               is_banned                            as "isBanned",
               ban_date                             as "banDate",
               ban_reason                           as "banReason" 
            FROM users 
                WHERE login = $1`,
      [login],
    );

    return result[0] || null;
  }

  async throwIfEmailInUse(email: string): Promise<void | never> {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );
    if (result.length > 0) {
      throw new EntityAlreadyExistsException(
        `User with email: ${email} already exists`,
        'email',
      );
    }
  }

  async throwIfLoginInUse(login: string): Promise<void | never> {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE login = $1`,
      [login],
    );
    if (result.length > 0) {
      throw new EntityAlreadyExistsException(
        `User with login: ${login} already exists`,
        'login',
      );
    }
  }

  async getByConfirmationCode(confirmationCode): Promise<any | never> {
    const result = await this.dataSource.query(
      `
    SELECT id,
           login,
           email,
           password_hash                        as "passwordHash",
           created_at                           as "createdAt",
           confirmation_code                    as "confirmationCode",
           expiration_date_of_confirmation_code as "expirationDate",
           is_confirmed                         as "isConfirmed",
           is_banned                            as "isBanned",
           ban_date                             as "banDate",
           ban_reason                           as "banReason"
    FROM users
    WHERE confirmation_code = $1`,
      [confirmationCode],
    );

    if (result.length === 0) {
      throw new UnprocessableEntityException(
        `User with confirmationCode: "${confirmationCode}" is not found`,
      );
    }

    return result[0];
  }

  async saveNewUser(newUser: any): Promise<void> {
    const query = `
    INSERT INTO users (
      login,
      email,
      password_hash,
      created_at,
      confirmation_code,
      expiration_date_of_confirmation_code,
      is_confirmed,
      is_banned,
      ban_date,
      ban_reason
    )
    VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

    await this.dataSource.query(query, [
      newUser.login,
      newUser.email,
      newUser.passwordHash,
      newUser.createdAt,
      newUser.confirmationCode,
      newUser.expirationDate,
      newUser.isConfirmed,
      newUser.isBanned,
      newUser.banDate,
      newUser.banReason,
    ]);
  }

  async confirmEmail(userId: string) {
    await this.dataSource.query(
      `UPDATE users SET is_confirmed = true WHERE id = $1`,
      [userId],
    );
  }

  async forTest_resetExpirationDateOfConfirmationCodeToCurrentDate(
    userId: string,
  ) {
    await this.dataSource.query(
      'UPDATE users SET expiration_date_of_confirmation_code = $1 WHERE id = $2',
      [new Date(), userId],
    );
  }

  async getByEmail(email: string) {
    const result = await this.dataSource.query(
      `
    SELECT id,
           login,
           email,
           password_hash                        as "passwordHash",
           created_at                           as "createdAt",
           confirmation_code                    as "confirmationCode",
           expiration_date_of_confirmation_code as "expirationDate",
           is_confirmed                         as "isConfirmed",
           is_banned                            as "isBanned",
           ban_date                             as "banDate",
           ban_reason                           as "banReason"
    FROM users
    WHERE email = $1`,
      [email],
    );

    if (result.length === 0) {
      throw new EntityNotFoundException(
        `User with email: ${email} is not found`,
        'email',
      );
    }

    return result[0];
  }

  async refreshEmailConfirmationInfo(
    userId: string,
    confirmationCode: string,
    expirationDate: Date,
  ) {
    await this.dataSource.query(
      `UPDATE users
       SET confirmation_code = $1,
           expiration_date_of_confirmation_code = $2
       WHERE id = $3`,
      [confirmationCode, expirationDate, userId],
    );
  }

  async getById(userId: string) {
    const user = await this.dataSource.query(
      `SELECT id,
              login,
              email,
              password_hash                        as "passwordHash",
              created_at                           as "createdAt",
              confirmation_code                    as "confirmationCode",
              expiration_date_of_confirmation_code as "expirationDate",
              is_confirmed                         as "isConfirmed",
              is_banned                            as "isBanned",
              ban_date                             as "banDate",
              ban_reason                           as "banReason" FROM users WHERE id = $1`,
      [userId],
    );

    if (!user) {
      throw new EntityNotFoundException(
        `User with id: "${userId}" does not exist`,
      );
    }
    return user[0];
  }

  async getByLoginOrEmail(loginOrEmail: string) {
    const user = await this.dataSource.query(
      `SELECT id,
              login,
              email,
              password_hash                        as "passwordHash",
              created_at                           as "createdAt",
              confirmation_code                    as "confirmationCode",
              expiration_date_of_confirmation_code as "expirationDate",
              is_confirmed                         as "isConfirmed",
              is_banned                            as "isBanned",
              ban_date                             as "banDate",
              ban_reason                           as "banReason" FROM users WHERE login = $1 OR email = $1`,
      [loginOrEmail],
    );

    if (user.length === 0) {
      throw new EntityNotFoundException(
        `User with email or login "${loginOrEmail}" does not exist`,
      );
    }
    return user[0] || null;
  }

  async setNewPassword(passwordHash: string, userId: string) {
    await this.dataSource.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, userId],
    );
  }

  async deleteById(userId: string) {
    await this.dataSource.query(`DELETE FROM users WHERE id = $1`, [userId]);
  }

  async throwIfUserIsNotExists(userId: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId],
    );
    if (result.length === 0) {
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
    banReason: string | boolean,
  ) {
    await this.dataSource.query(
      `UPDATE users SET is_banned = $1, ban_date = $2, ban_reason = $3 WHERE id = $4`,
      [isBanned, banDate, banReason, userId],
    );
  }
}
