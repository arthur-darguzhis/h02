import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TestingService {
  constructor(
    @InjectConnection() private readonly mongooseConnection: Connection,
  ) {}

  async dropDatabase() {
    await this.mongooseConnection.dropDatabase();
  }
}
