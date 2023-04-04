import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSessionsPgRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async saveNewSession(
    issuedAt,
    expireAt,
    deviceId,
    ip,
    deviceName = 'unknown',
    userId,
  ) {
    const query = `
    INSERT INTO users_sessions (
      issued_at,
      expire_at,
      device_id,
      ip,
      device_name,
      user_id) 
    VALUES ($1, $2, $3, $4, $5, $6)`;

    await this.dataSource.query(query, [
      issuedAt,
      expireAt,
      deviceId,
      ip,
      deviceName,
      userId,
    ]);
  }
}
