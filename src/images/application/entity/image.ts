import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column('smallint')
  width: number;

  @Column('smallint')
  height: number;

  @Column('bigint')
  size: number;
}
