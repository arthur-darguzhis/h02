import { Column, Model, Table } from 'sequelize-typescript';
import { PrimaryGeneratedColumn } from 'typeorm';

@Table
export class User extends Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column
  login: string;

  @Column
  passwordHash: string;

  @Column
  email: string;

  @Column
  isActive: boolean;
}
