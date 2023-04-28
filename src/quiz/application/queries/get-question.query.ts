import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exceptions/entity-not-found.exception';

export class GetQuestionQuery {
  constructor(public readonly questionId: string) {}
}

@QueryHandler(GetQuestionQuery)
export class GetQuestionHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetQuestionQuery) {
    const question = await this.dataSource.query(
      `SELECT 
                id,
                body,
                correct_answers as "correctAnswers",
                published,
                created_at as "createdAt",
                updated_at as "updatedAt" 
            FROM quiz_questions 
            WHERE id = $1`,
      [query.questionId],
    );

    if (question.length === 0) {
      throw new EntityNotFoundException(
        `Quiz question with id: ${query.questionId} is not found`,
      );
    }
    return question[0] || null;
  }
}
