// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('requests')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  state: string;

  @Column()
  repaymentDate: Date;

  @Column()
  comments: string;

  @CreateDateColumn()
  startDate: Date;

  @UpdateDateColumn()
  endDate: Date;
}