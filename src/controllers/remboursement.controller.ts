import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { RemboursementService } from '../services/remboursement.service';
import { Remboursement } from '../entity/remboursement.entity';

@Controller('remboursements')
export class RemboursementController {
  constructor(private readonly remboursementService: RemboursementService) {}

  @Post()
  async create(@Body() data: Partial<Remboursement>): Promise<Remboursement> {
    return this.remboursementService.create(data);
  }

  @Get()
  async findAll(): Promise<Remboursement[]> {
    return this.remboursementService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Remboursement> {
    return this.remboursementService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Remboursement>): Promise<Remboursement> {
    return this.remboursementService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.remboursementService.delete(id);
  }
}
