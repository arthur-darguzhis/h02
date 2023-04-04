import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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
}
