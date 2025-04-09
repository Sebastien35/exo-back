// src/services/TenantService.ts
import { Injectable } from '@nestjs/common'; // or your framework's DI
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../entity/tenant.entity';
import { User } from '../entity/user.entity';
import { CentralDataSource } from '../databases/centralDB.config'; // Adjust the import path as necessary   
import { CreateTenantDto } from '../DTO/createTenant.dto'; // Adjust the import path as necessary
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  private tenantRepository: Repository<Tenant>;
  private userRepository: Repository<User>;

  constructor() {
    this.tenantRepository = CentralDataSource.getRepository(Tenant);
    this.userRepository = CentralDataSource.getRepository(User);
  }

  async createTenant(createTenantDto: CreateTenantDto): Promise<{ tenant: Tenant; adminUser: User }> {
    // Start transaction
    const queryRunner = CentralDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      // Step 1: Create the database for the tenant
      const tenantDbName = createTenantDto.dbName || `tenant_${createTenantDto.name.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Check if the database already exists (optional but recommended)
      const dbCheckQuery = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${tenantDbName}'`;
      const existingDb = await queryRunner.manager.query(dbCheckQuery);
  
      if (existingDb.length === 0) {
        // Create the database if it doesn't exist
        await queryRunner.manager.query(`CREATE DATABASE ${tenantDbName}`);
        console.log(`Database ${tenantDbName} created successfully.`);
      } else {
        console.log(`Database ${tenantDbName} already exists.`);
      }
  
      // Step 2: Create tenant record with the new database information
      const tenant = this.tenantRepository.create({
        name: createTenantDto.name,
        description: createTenantDto.description,
        dbHost: createTenantDto.dbHost,
        dbPort: createTenantDto.dbPort,
        dbUsername: createTenantDto.dbUsername,
        dbPassword: createTenantDto.dbPassword,
        dbName: tenantDbName,
      });
  
      await queryRunner.manager.save(tenant);
  
      // Step 3: Create admin user for the tenant
      const adminUser = this.userRepository.create({
        email: createTenantDto.adminEmail,
        passwordHash: await this.hashPassword(createTenantDto.adminPassword),
        tenantId: tenant.id,
        role: 'admin',
      });
  
      await queryRunner.manager.save(adminUser);
  
      // Commit transaction
      await queryRunner.commitTransaction();
  
      return { tenant, adminUser };
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async updateTenant(id: string, updateData: Partial<Tenant>): Promise<Tenant> {
    await this.tenantRepository.update(id, updateData);
    const tenant = await this.getTenantById(id);
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    // Note: You might want to soft delete instead
    await this.tenantRepository.delete(id);
  }

  async getTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async hashPassword(password: string): Promise<string> {   
    const saltRounds = 10; // Adjust the salt rounds as necessary
    return await bcrypt.hash(password, saltRounds);
  }
}