import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ConsultationService } from '../services/consultation.service';
import { Consultation } from '../entity/consultation.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import { User } from '../entity/user.entity';
import { Customer } from '../entity/customer.entity';
import { getTenantDataSource } from '../databases/tenants.config';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: Partial<Consultation>, @Request() req): Promise<Consultation> {
    const customer: Customer = req.user;
    if (!customer) {
      throw new UnauthorizedException('You are not authorized to create a consultation');
    }
    data.customerId = customer.id; // Assuming the customer ID is passed in the request body
    const tenantId = req.user.tenantId; // Assuming the tenant ID is passed in the request body
    const dataSource = await getTenantDataSource(tenantId);
    const consultationRepository = dataSource.getRepository(Consultation);
    const consultation = consultationRepository.create(data);
    return consultationRepository.save(consultation);
  }

  @Get()
  async findAll(@Request() req): Promise<Consultation[]> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    return this.consultationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Consultation> {
    const user: User = req.user;
    return this.consultationService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Consultation>, @Request() req): Promise<Consultation> {
    const user: User = req.user;
    return this.consultationService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const user: User = req.user;
    return this.consultationService.delete(id);
  }
}
