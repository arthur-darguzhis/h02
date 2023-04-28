import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'quiz_questions' })
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'text', collation: 'C', name: 'body' })
  body: string;

  @Column({
    type: 'text',
    array: true,
    name: 'correct_answers',
  })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false, name: 'published' })
  published: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date;
}
