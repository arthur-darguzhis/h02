import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetQuestionsListQuery {
  constructor(
    public readonly bodySearchTerm: string = null,
    public readonly publishedStatus: string = 'all',
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: string = 'desc',
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
  ) {}
}

@QueryHandler(GetQuestionsListQuery)
export class GetQuestionsListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async execute(query: GetQuestionsListQuery) {
    console.log(query);

    let publishedStatus;

    if (query.publishedStatus === 'published') {
      publishedStatus = true;
    }
    if (query.publishedStatus === 'notPublished') {
      publishedStatus = false;
    }

    const bodySearchTerm = query.bodySearchTerm
      ? `%${query.bodySearchTerm}%`
      : null;

    let count = await this.dataSource.query(
      `SELECT
           COUNT(*) as count
       FROM quiz_questions 
       WHERE ($1::boolean IS NULL OR published = $1) 
       AND ($2::varchar is null or body ILIKE $2::varchar)`,
      [publishedStatus, bodySearchTerm],
    );

    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const sortFields = {
      body: 'body',
      published: 'published',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const questions = await this.dataSource.query(
      `SELECT
           id,
           body,
           correct_answers as "correctAnswers",
           published,
           created_at as "createdAt",
           updated_at as "updatedAt"
       FROM quiz_questions 
       WHERE ($1::boolean IS NULL OR published = $1) 
       AND ($2::varchar is null or body ILIKE $2::varchar)
       ORDER BY ${sortFields[query.sortBy]} ${query.sortDirection}
       LIMIT $3 OFFSET $4`,
      [publishedStatus, bodySearchTerm, query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: questions,
    };
  }
}
