import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserSessionsPgRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

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

  async updateSessionByDeviceId(
    deviceId: string,
    refreshToken: string,
    ip: string,
    userAgent = 'unknown',
  ) {
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken, {
      json: true,
    });

    await this.dataSource.query(
      `UPDATE users_sessions 
             SET issued_at = $1, expire_at = $2, ip = $3, device_name = $4 
             WHERE device_id = $5`,
      [
        decodedRefreshToken.iat,
        decodedRefreshToken.exp,
        ip,
        userAgent,
        deviceId,
      ],
    );
  }

  async findByDeviceId(deviceId: string): Promise<any | never> {
    const userSession = await this.dataSource.query(
      `SELECT id, issued_at as "issuedAt",
              expire_at as "expireAt",
              device_id as "deviceId",
              ip,
              device_name as "deviceName",
              user_id 
            FROM users_sessions 
            WHERE device_id = $1`,
      [deviceId],
    );

    return userSession[0] || null;
  }

  async findAllSessionsByUser(userId: string): Promise<any | never> {
    return await this.dataSource.query(
      `SELECT id, issued_at as "issuedAt",
              expire_at as "expireAt",
              device_id as "deviceId",
              ip,
              device_name as "deviceName",
              user_id 
            FROM users_sessions 
            WHERE user_id = $1`,
      [userId],
    );
  }

  async removeOne(deviceId: string, userId: string) {
    await this.dataSource.query(
      'DELETE FROM users_sessions WHERE device_id = $1 AND user_id = $2',
      [deviceId, userId],
    );
  }

  async forTest_findByUserId(userId) {
    return await this.dataSource.query(
      `SELECT * FROM users_sessions WHERE user_id = $1`,
      [userId],
    );
  }

  async deleteAllSessionsByUserId(userId: string) {
    await this.dataSource.query(
      `DELETE FROM users_sessions WHERE user_id = $1`,
      [userId],
    );
  }

  async purgeOtherSessions(deviceId: string, userId: string) {
    await this.dataSource.query(
      `DELETE FROM users_sessions WHERE user_id = $1 AND device_id <> $2`,
      [userId, deviceId],
    );
  }
}
