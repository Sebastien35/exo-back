import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { Remboursement } from '../entity/remboursement.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import { getTenantDataSource } from '../databases/tenants.config';
import { User } from '../entity/user.entity';

@Controller('remboursements')
export class RemboursementController {
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() data: Partial<Remboursement>): Promise<Remboursement> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const remboursementRepository = tenantDataSource.getRepository(Remboursement);
    const remboursement = remboursementRepository.create(data);
    return remboursementRepository.save(remboursement);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<Remboursement[]> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const remboursementRepository = tenantDataSource.getRepository(Remboursement);
    return remboursementRepository.find();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Remboursement> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const remboursementRepository = tenantDataSource.getRepository(Remboursement);
    const remboursement = await remboursementRepository.findOne({ where: { id } });

    if (!remboursement) {
      throw new NotFoundException('Remboursement not found');
    }

    return remboursement;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: Partial<Remboursement>): Promise<Remboursement> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const remboursementRepository = tenantDataSource.getRepository(Remboursement);

    const remboursement = await remboursementRepository.findOne({ where: { id } });
    if (!remboursement) {
      throw new NotFoundException('Remboursement not found');
    }

    remboursementRepository.merge(remboursement, data);
    return remboursementRepository.save(remboursement);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    const user: User = req.user;
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const remboursementRepository = tenantDataSource.getRepository(Remboursement);

    const remboursement = await remboursementRepository.findOne({ where: { id } });
    if (!remboursement) {
      throw new NotFoundException('Remboursement not found');
    }

    await remboursementRepository.remove(remboursement);
    return { message: 'Remboursement deleted successfully' };
  }
}
