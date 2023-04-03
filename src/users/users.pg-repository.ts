import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityAlreadyExistsException } from '../common/exceptions/domain.exceptions/entity-already-exists.exception';

@Injectable()
export class UsersPgRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findByLogin(login: string) {
    return this.dataSource.query('SELECT * FROM users WHERE login = $1', [
      login,
    ]);
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
}
