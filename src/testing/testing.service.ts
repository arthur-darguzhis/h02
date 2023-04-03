import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingService {
  constructor(
    @InjectConnection() private readonly mongooseConnection: Connection,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async dropDatabase() {
    await this.mongooseConnection.dropDatabase();
    await this.dataSource.query(`
DO $$ DECLARE
  r record;
BEGIN
  -- Get the list of tables in the current database
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
  END LOOP;
END $$;
`);
  }
}
