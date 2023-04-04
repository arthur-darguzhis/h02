import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersPgQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findOne(currentUserId: string) {
    return await this.dataSource.query(
      `SELECT id as "userId",
               login,
               email
             FROM users WHERE id = $1`,
      [currentUserId],
    );
  }
}
