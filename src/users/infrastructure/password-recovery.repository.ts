import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { PasswordRecovery } from '../application/entities/password-recovery';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PasswordRecovery)
    private passwordRecoveryRepository: Repository<PasswordRecovery>,
  ) {}

  async savePasswordRecoveryMetadata(
    code: string,
    sendingTime,
    expirationDate,
    isConfirmed,
    userId,
  ): Promise<void> {
    const query = `
    INSERT INTO password_recovery (
      code,
      sending_time,
      expiration_date,
      is_confirmed,
      user_id
    )
    VALUES ( $1, $2, $3, $4, $5)
  `;

    await this.dataSource.query(query, [
      code,
      sendingTime,
      expirationDate,
      isConfirmed,
      userId,
    ]);
  }

  async getByCode(recoveryCode: string) {
    const passwordRecovery = await this.dataSource.query(
      `SELECT
                code,
                sending_time as "sendingTime",
                expiration_date as "expirationDate",
                is_confirmed as "isConfirmed",
                user_id as "userId"
            FROM password_recovery
            WHERE code = $1`,
      [recoveryCode],
    );

    if (passwordRecovery.length === 0) {
      throw new EntityNotFoundException('invalid password recovery');
    }

    return passwordRecovery[0];
  }

  async forTests_getByUserId(userId: string) {
    const passwordRecovery = await this.dataSource.query(
      `SELECT
                id,
                code,
                sending_time as "sendingTime",
                expiration_date as "expirationDate",
                is_confirmed as "isConfirmed",
                user_id as "userId"
            FROM password_recovery
            WHERE user_id = $1`,
      [userId],
    );

    if (passwordRecovery.length === 0) {
      throw new EntityNotFoundException('invalid password recovery');
    }

    return passwordRecovery[0];
  }

  async confirmPasswordRecovery(code) {
    await this.dataSource.query(
      `UPDATE password_recovery SET is_confirmed = true WHERE code = $1`,
      [code],
    );
  }

  async forTest_resetExpirationDate(id) {
    await this.dataSource.query(
      'UPDATE password_recovery SET expiration_date = $1 WHERE id = $2',
      [new Date(), id],
    );
  }
}
