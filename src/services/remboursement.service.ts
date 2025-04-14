import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Remboursement } from '../entity/remboursement.entity';

@Injectable()
export class RemboursementService {
  private remboursementRepository: Repository<Remboursement>;

  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {
    this.remboursementRepository = this.entityManager.getRepository(Remboursement);
  }

  async create(data: Partial<Remboursement>): Promise<Remboursement> {
    const remboursement = this.remboursementRepository.create(data);
    return this.remboursementRepository.save(remboursement);
  }

  async findAll(): Promise<Remboursement[]> {
    return this.remboursementRepository.find({ relations: ['consultation'] });
  }

  async findOne(id: string): Promise<Remboursement> {
    const remboursement = await this.remboursementRepository.findOne({
      where: { id },
      relations: ['consultation'],
    });
    if (!remboursement) {
      throw new NotFoundException(`Remboursement with id ${id} not found`);
    }
    return remboursement;
  }

  async update(id: string, data: Partial<Remboursement>): Promise<Remboursement> {
    await this.remboursementRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.remboursementRepository.delete(id);
  }
}
