// src/entities/Tenant.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Adjust the import path as necessary

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  // Database connection details for this tenant
  @Column({ nullable: true })
  dbHost: string;

  @Column({ nullable: true, type: 'int' })
  dbPort: number;

  @Column({ nullable: true })
  dbUsername: string;

  @Column({ nullable: true })
  dbPassword: string;

  @Column({ nullable: true })
  dbName: string;

  @Column({ nullable: true })
  dbUser: string;

  // Tenant status
  @Column({ default: 'active' })
  status: 'active' | 'suspended' | 'inactive';

  // Billing/reference information
  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  subscriptionPlan: string;

  @Column({ nullable: true, type: 'timestamp' })
  subscriptionExpiresAt: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.tenant)
  users: User[];
}