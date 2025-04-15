import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto } from '../DTO/createTenant.dto';
import { Tenant } from '../entity/tenant.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import { User } from '../entity/user.entity';
import { NotFoundException } from '@nestjs/common';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req): Promise<Tenant> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can create tenants');
    }
    return this.tenantService.createTenant(createTenantDto);
  }

  @Get()
  async findAll(@Request() req): Promise<{ tenantId: string; tenantName: string }[]> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can access the tenant list');
    }

    const tenants = await this.tenantService.getTenants();
    return tenants.map((tenant) => ({
      tenantId: tenant.id,
      tenantName: tenant.name,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Tenant> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException();
    }
  
    const tenant = await this.tenantService.getTenantById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  
    return tenant;
  }
  

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Tenant>, @Request() req): Promise<Tenant> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can update tenants');
    }
    return this.tenantService.updateTenant(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    const user: User = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can delete tenants');
    }
    await this.tenantService.deleteTenant(id);
    return { message: 'Tenant deleted successfully' };
  }
}
