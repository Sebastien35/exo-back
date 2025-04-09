// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmTenantService } from '../services/typeorm-tenant.service';

@Module({
  providers: [TypeOrmTenantService],
  exports: [TypeOrmTenantService],
})
export class DatabaseModule {}
