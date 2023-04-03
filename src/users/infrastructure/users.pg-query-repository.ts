import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UnprocessableEntityException } from '../../common/exceptions/domain.exceptions/unprocessable-entity.exception';

@Injectable()
export class UsersPgQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findOne(currentUserId: string) {
    const user = await this.dataSource.query(
      `SELECT id as "userId",
               login,
               email
             FROM users WHERE id = $1`,
      [currentUserId],
    );
    return user[0];
  }

  async findByEmail(email: string) {
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
                WHERE email = $1`,
      [email],
    );

    if (result.length === 0) {
      throw new UnprocessableEntityException(
        `User with email: ${email} is not found`,
      );
    }

    return result[0];
  }
}
