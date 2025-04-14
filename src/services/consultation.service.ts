import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Consultation } from '../entity/consultation.entity';

@Injectable()
export class ConsultationService {
  private consultationRepository: Repository<Consultation>;

  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {
    this.consultationRepository = this.entityManager.getRepository(Consultation);
  }

  async create(data: Partial<Consultation>): Promise<Consultation> {
    console.log('Données reçues dans create consultation :', data);

    const consultation = this.consultationRepository.create(data);
    return this.consultationRepository.save(consultation);
  }

  async findAll(): Promise<Consultation[]> {
    return this.consultationRepository.find();
  }

  async findOne(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOneBy({ id });
    if (!consultation) {
      throw new NotFoundException(`Consultation with id ${id} not found`);
    }
    return consultation;
  }

  async update(id: string, data: Partial<Consultation>): Promise<Consultation> {
    await this.consultationRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.consultationRepository.delete(id);
  }
}
