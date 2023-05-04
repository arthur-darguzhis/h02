import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isArray } from 'class-validator';
import { InvalidValueException } from '../../../common/exceptions/domain.exceptions/invalid-value-exception';

export class GetUsersTopListQuery {
  constructor(
    public readonly sort: string | string[],
    public readonly pageSize: number = 10,
    public readonly pageNumber: number = 1,
  ) {}
}

@QueryHandler(GetUsersTopListQuery)
export class GetUsersTopListHandler implements IQueryHandler {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  private sortFields = {
    sumScore: 'sumScore',
    avgScores: 'avgScores',
    gamesCount: 'gamesCount',
    winsCount: 'winsCount',
    lossesCount: 'lossesCount',
    drawsCount: 'drawsCount',
  };

  private sortDirections = {
    desc: 'desc',
    asc: 'asc',
  };

  async execute(query: GetUsersTopListQuery) {
    const sortByConditions = this.prepareSortConditions(query.sort);

    let count = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM game_players_statistic GROUP BY user_id`,
    );
    count = Number(count[0].count);
    const offset = (query.pageNumber - 1) * query.pageSize;

    const top = await this.dataSource.query(
      `
        SELECT
            COUNT(game_id)::int                          AS "gamesCount",
            COUNT(*) FILTER (WHERE result = 'Win')::int  AS "winsCount",
            COUNT(*) FILTER (WHERE result = 'Lose')::int AS "lossesCount",
            COUNT(*) FILTER (WHERE result = 'Draw')::int AS "drawsCount",
            SUM(score)::int                              AS "sumScore",
            ROUND(AVG(score), 2)::float                  AS "avgScores",
            (SELECT jsonb_build_object('id', users.id, 'login', users.login) FROM users WHERE users.id = game_players_statistic.user_id) as player
        FROM game_players_statistic
          GROUP BY user_id
          ORDER BY ${sortByConditions}
        LIMIT $1 OFFSET $2
          `,
      [query.pageSize, offset],
    );

    return {
      pagesCount: Math.ceil(count / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: count,
      items: top,
    };
  }

  private prepareSortConditions(sort: string | string[]): string {
    let sortBy = [];
    if (!isArray(sort)) {
      sortBy = [sort];
    } else {
      sortBy = sort;
    }

    sortBy = sortBy.map((str) => {
      const [column, direction] = str.split(' ');

      if (
        !this.sortFields.hasOwnProperty(column) ||
        !this.sortDirections.hasOwnProperty(direction)
      ) {
        throw new InvalidValueException(
          'Parameters in sort are incorrect',
          'sort',
        );
      }
      return `"${column}" ${direction}`;
    });

    return sortBy.join(', ');
  }
}
