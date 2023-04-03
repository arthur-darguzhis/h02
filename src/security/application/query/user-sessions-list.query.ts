import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class UserSessionsListQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(UserSessionsListQuery)
export class UserSessionsListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: UserSessionsListQuery) {
    console.log(query);
    const userSessions = await this.dataSource.query(
      `SELECT id, issued_at as "issuedAt",
              expire_at as "expireAt",
              device_id as "deviceId",
              ip,
              device_name as "deviceName",
              user_id as "userId"
            FROM users_sessions WHERE user_id = $1`,
      [query.userId],
    );

    return userSessions.map((userSession) => {
      return {
        ip: userSession.ip,
        title: userSession.deviceName,
        lastActiveDate: new Date(userSession.issuedAt * 1000).toISOString(),
        deviceId: userSession.deviceId,
      };
    });
  }
}
