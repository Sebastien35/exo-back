// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('requests')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  consultationDate: Date;

  @Column()
  montant: number;

  @CreateDateColumn()
  type: string;
}