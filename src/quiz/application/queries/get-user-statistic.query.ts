import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class GetUserStatisticQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserStatisticQuery)
export class GetUserStatisticHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async execute(query: GetUserStatisticQuery) {
    const statistic = await this.dataSource.query(
      `
        SELECT 
           SUM(score)::int as "sumScore",
           ROUND(AVG(score), 2)::float as "avgScores",
           COUNT(game_id)::int as "gamesCount",
           COUNT(*) FILTER (WHERE result = 'Win')::int AS "winsCount",
           COUNT(*) FILTER (WHERE result = 'Lose')::int AS "lossesCount",
           COUNT(*) FILTER (WHERE result = 'Draw')::int AS "drawsCount"
        FROM game_players_statistic WHERE user_id = $1`,
      [query.userId],
    );

    return statistic[0];
  }
}
