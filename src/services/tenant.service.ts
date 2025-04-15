import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../entity/tenant.entity';
import { User } from '../entity/user.entity';
import { CentralDataSource } from '../databases/centralDB.config';
import { CreateTenantDto } from '../DTO/createTenant.dto';
import * as bcrypt from 'bcrypt';
import { getTenantDataSource } from '../databases/tenants.config';
import { EncryptionService, EncryptedData } from './encryption.service';


@Injectable()
export class TenantService {
  private tenantRepository: Repository<Tenant>;
  private userRepository: Repository<User>;

  constructor(
    private readonly encryptionService: EncryptionService
  ) {
    this.tenantRepository = CentralDataSource.getRepository(Tenant);
    this.userRepository = CentralDataSource.getRepository(User);
  }

  private readonly encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32-byte hex key

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const queryRunner = CentralDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    let tenant: Tenant;
  
    try {
      const tenantDbName =
        createTenantDto.dbName ||
        `tenant_${createTenantDto.name.toLowerCase().replace(/\s+/g, '_')}`;
  
      const dbExists = await queryRunner.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [tenantDbName],
      );
  
      if (dbExists.length === 0) {
        await queryRunner.query(`CREATE DATABASE \`${tenantDbName}\``);
        await queryRunner.query(
          `GRANT ALL PRIVILEGES ON \`${tenantDbName}\`.* TO 'app'@'%' IDENTIFIED BY ?`,
          [createTenantDto.dbPassword],
        );
      }
  
      tenant = this.tenantRepository.create({
        name: createTenantDto.name,
        description: createTenantDto.description,
        dbHost: createTenantDto.dbHost,
        dbPort: 3308,
        dbUsername: createTenantDto.dbUsername
          ? JSON.stringify(this.encryptionService.encrypt(createTenantDto.dbUsername))
          : undefined,
        dbPassword: createTenantDto.dbPassword
          ? JSON.stringify(this.encryptionService.encrypt(createTenantDto.dbPassword))
          : undefined,
        dbName: tenantDbName,
      });
  
      await queryRunner.manager.save(tenant);
  
      const adminUser = this.userRepository.create({
        email: createTenantDto.adminEmail,
        passwordHash: await this.hashPassword(createTenantDto.adminPassword),
        tenantId: tenant.id,
        role: 'admin',
      });
  
      await queryRunner.manager.save(adminUser);
  
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  
    await getTenantDataSource(tenant.id);
    return tenant; // ✅ Retourne uniquement le tenant
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
    await this.tenantRepository.delete(id);
  }

  async getTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
