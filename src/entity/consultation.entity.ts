// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity'; // Adjust the import path as necessary

@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  consultationDate: Date;

  @Column()
  montant: number;

  @CreateDateColumn()
  type: string;

  @Column()
  customerId: string;
}