// src/controllers/TenantController.ts
import { Body, Controller, Get, Post, Param, Put, Delete } from '@nestjs/common'; // or your framework's decorators
import { TenantService } from '../services/tenant.service'; // Adjust the import path as necessary  
import { CreateTenantDto } from '../DTO/createTenant.dto'; // Adjust the import path as necessary
import { Tenant } from '../entity/tenant.entity'; // Adjust the import path as necessary

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Get()
  async findAll() {
    const tenants = await this.tenantService.getTenants();
    let tenantArray = [
      {
        id: 'string',
        name: 'string',
      },
    ];
    let returnData: { tenantId: string; tenantName: string }[] = [];
    for (const tenant of tenants) {
      tenantArray[0].id = tenant.id;
      tenantArray[0].name = tenant.name;
      returnData.push({ tenantId: tenant.id, tenantName: tenant.name });
    }
    return returnData;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Tenant>) {
    return this.tenantService.updateTenant(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}