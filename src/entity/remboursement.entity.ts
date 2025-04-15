import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Consultation } from './consultation.entity';
  
  @Entity('remboursements')
  export class Remboursement {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    montant: number;
  
    @Column()
    statut: string; // ex: "en_attente", "accepté", "refusé"
  
    @Column()
    consultationId: string;
  
    @ManyToOne(() => Consultation, { nullable: false })
    @JoinColumn({ name: 'consultationId' })
    consultation: Consultation;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  