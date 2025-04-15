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
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import { User } from '../entity/user.entity';
import { Customer } from '../entity/customer.entity';
import { Consultation } from '../entity/consultation.entity';
import { getTenantDataSource } from '../databases/tenants.config';
import * as bcrypt from 'bcrypt';


@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationController {
  // Créer une consultation
  @Post()
  async create(@Body() data: Partial<Consultation>, @Request() req): Promise<Consultation> {
    const user: User = req.user;

    if (!user || (user.role !== 'customer' && user.role !== 'admin')) {
      throw new UnauthorizedException('You are not authorized to create a consultation');
    }

    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const consultationRepository = tenantDataSource.getRepository(Consultation);
    
    const consultation = consultationRepository.create(data);
    return consultationRepository.save(consultation);
  }

  // Voir toutes les consultations
  @Get()
  async findAll(@Request() req): Promise<Consultation[]> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const consultationRepository = tenantDataSource.getRepository(Consultation);

    if (user.role === 'admin') {
      // L’admin voit toutes les consultations du tenant
      return consultationRepository.find();
    }

    // Le customer voit uniquement ses propres consultations
    return consultationRepository.find({
      where: { customerId: user.id },
    });
  }

  // Voir une consultation spécifique
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Consultation> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const consultationRepository = tenantDataSource.getRepository(Consultation);

    const consultation = await consultationRepository.findOneBy({ id });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // Vérification des droits
    if (user.role !== 'admin' && consultation.customerId !== user.id) {
      throw new UnauthorizedException('You are not authorized to access this consultation');
    }

    return consultation;
  }

  // Modifier une consultation
  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: Partial<Consultation>, @Request() req): Promise<Consultation> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const consultationRepository = tenantDataSource.getRepository(Consultation);

    const consultation = await consultationRepository.findOneBy({ id });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    // Seul l’admin peut modifier toutes les consultations
    if (user.role !== 'admin' && consultation.customerId !== user.id) {
      throw new UnauthorizedException('You are not authorized to update this consultation');
    }

    Object.assign(consultation, updates);
    return consultationRepository.save(consultation);
  }

  // Supprimer une consultation
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const consultationRepository = tenantDataSource.getRepository(Consultation);

    const consultation = await consultationRepository.findOneBy({ id });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    if (user.role !== 'admin' && consultation.customerId !== user.id) {
      throw new UnauthorizedException('You are not authorized to delete this consultation');
    }

    await consultationRepository.delete(id);
    return { message: 'Consultation deleted successfully' };
  }

    @Get('customer/:customerId')
    async findByCustomerId(@Param('customerId') customerId: string, @Request() req): Promise<Consultation[]> {  
      const user: any = req.user;
      const tenantDataSource = await getTenantDataSource(user.tenantId);
      const consultationRepository = tenantDataSource.getRepository(Consultation);

      if ((user.role !== 'admin') || ((user.id !== customerId) && user.id !== undefined)) {
        console.log(user.role, user.id, customerId) 
        throw new UnauthorizedException('You are not authorized to access this resource');
      }
      return consultationRepository.findBy({ customerId });
      
    }

}
