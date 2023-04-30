import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetResultOfAnswerQuery {
  constructor(public readonly gameProgressId: string) {}
}

@QueryHandler(GetResultOfAnswerQuery)
export class GetResultOfAnswerHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetResultOfAnswerQuery) {
    const result = await this.dataSource.query(
      `SELECT 
              quiz_question_id as "questionId", 
              answer_status as "answerStatus", 
              answer_date as "addedAt" 
              FROM game_progress 
              WHERE id = $1`,
      [query.gameProgressId],
    );

    return result[0];
  }
}
