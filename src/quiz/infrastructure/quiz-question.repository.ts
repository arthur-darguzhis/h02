import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuizQuestion } from '../application/entities/quiz-question';
import { EntityNotFoundException } from '../../common/exceptions/domain.exceptions/entity-not-found.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionsRepository: Repository<QuizQuestion>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async save(quizQuestion: QuizQuestion) {
    return await this.quizQuestionsRepository.save(quizQuestion);
  }

  async delete(quizQuestion: QuizQuestion) {
    await this.quizQuestionsRepository.remove(quizQuestion);
  }

  async findById(quizQuestionId: string) {
    return this.quizQuestionsRepository.findOneBy({ id: quizQuestionId });
  }

  async getById(quizQuestionId: string) {
    const post = await this.findById(quizQuestionId);
    if (post === null) {
      throw new EntityNotFoundException(
        `Quiz question with id: ${quizQuestionId} is not found`,
      );
    }
    return post;
  }

  async getListOfId(questionsCount = 5): Promise<[{ id: string }]> {
    return await this.dataSource.query(
      `SELECT id FROM quiz_questions ORDER BY RANDOM() LIMIT $1;`,
      [questionsCount],
    );
  }
}
