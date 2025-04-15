// src/modules/document/document.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entity/document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(documentData: Partial<Document>): Promise<Document> {
    const doc = this.documentRepository.create(documentData);
    return this.documentRepository.save(doc);
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find();
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.documentRepository.findOneBy({ id });
    if (!doc) throw new NotFoundException(`Document with id ${id} not found`);
    return doc;
  }

  async update(id: string, updateData: Partial<Document>): Promise<Document> {
    await this.findOne(id); // Check if document exists
    await this.documentRepository.update(id, updateData);
    return this.findOne(id); // Return updated doc
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.documentRepository.delete(id);
  }
}
