import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ConsultationService } from '../services/consultation.service';
import { Consultation } from '../entity/consultation.entity';

@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  async create(@Body() data: Partial<Consultation>): Promise<Consultation> {
    return this.consultationService.create(data);
  }

  @Get()
  async findAll(): Promise<Consultation[]> {
    return this.consultationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Consultation> {
    return this.consultationService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Consultation>): Promise<Consultation> {
    return this.consultationService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.consultationService.delete(id);
  }
}
