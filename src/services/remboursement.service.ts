import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Remboursement } from '../entity/remboursement.entity';

@Injectable()
export class RemboursementService {
  async create(repo: Repository<Remboursement>, data: Partial<Remboursement>): Promise<Remboursement> {
    const remboursement = repo.create(data);
    return repo.save(remboursement);
  }

  async findAll(repo: Repository<Remboursement>): Promise<Remboursement[]> {
    return repo.find({ relations: ['consultation'] });
  }

  async findOne(repo: Repository<Remboursement>, id: string): Promise<Remboursement> {
    const remboursement = await repo.findOne({ where: { id }, relations: ['consultation'] });
    if (!remboursement) throw new NotFoundException(`Remboursement with id ${id} not found`);
    return remboursement;
  }

  async update(repo: Repository<Remboursement>, id: string, data: Partial<Remboursement>): Promise<Remboursement> {
    await repo.update(id, data);
    return this.findOne(repo, id);
  }

  async delete(repo: Repository<Remboursement>, id: string): Promise<void> {
    await repo.delete(id);
  }
}
