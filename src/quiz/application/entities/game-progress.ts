import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/application/entities/user';
import { Game } from './game';
import { QuizQuestion } from './quiz-question';
import { AnswerStatus } from '../../../common/pgTypes/enum/answerStatus';

@Entity({ name: 'game_progress' })
export class GameProgress {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('uuid', { name: 'game_id' })
  gameId: string;

  @Column('uuid', { name: 'quiz_question_id' })
  quizQuestionId: string;

  @Column('smallint', { name: 'question_number' })
  questionNumber: number;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('text', { name: 'answer', nullable: true })
  answer: string;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
    name: 'answer_status',
    nullable: true,
  })
  answerStatus: AnswerStatus;

  @Column('timestamp with time zone', { name: 'answer_date', nullable: true })
  answerDate: Date;
  //Foreign keys

  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @ManyToOne(() => QuizQuestion)
  @JoinColumn({ name: 'quiz_question_id' })
  quizQuestion: QuizQuestion;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  player: User;
}
