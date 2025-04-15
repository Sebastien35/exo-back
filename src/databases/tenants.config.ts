// src/databases/tenantLoader.ts
import { DataSource } from 'typeorm';
import { Tenant } from '../entity/tenant.entity';
import { CentralDataSource } from './centralDB.config';

import { Consultation } from '../entity/consultation.entity';
import { Customer } from '../entity/customer.entity';
import { Request } from '../entity/request.entity';
import { EncryptionService } from '../services/encryption.service';
import { Remboursement } from '../entity/remboursement.entity';

const tenantDataSources: Map<string, DataSource> = new Map();

const encryptionService = new EncryptionService(); // Initialize the encryption service

export async function getTenantDataSource(
  tenantOrId: string | Tenant
): Promise<DataSource> {
  const tenantId = typeof tenantOrId === 'string' ? tenantOrId : tenantOrId.id;

  // Return existing connection if initialized
  if (tenantDataSources.has(tenantId)) {
    const existing = tenantDataSources.get(tenantId)!;
    if (existing.isInitialized) return existing;
  }

  // If only ID is passed, fetch from central DB
  const tenant: Tenant = typeof tenantOrId === 'string'
    ? await CentralDataSource.getRepository(Tenant).findOneOrFail({ where: { id: tenantId } })
    : tenantOrId;

  // Ensure all required properties are present
  if (!tenant.dbHost || !tenant.dbPort || !tenant.dbUsername || !tenant.dbPassword || !tenant.dbName) {
    throw new Error(`Incomplete DB config for tenant ${tenant.id}`);
  }

  const tenantDataSource = new DataSource({
    type: 'mariadb',
    host: tenant.dbHost,
    port: tenant.dbPort,
    username: tenant.dbUsername ? encryptionService.decrypt(JSON.parse(tenant.dbUsername)) : undefined,
    password: tenant.dbPassword ? encryptionService.decrypt(JSON.parse(tenant.dbPassword)) : undefined,
    database: tenant.dbName,
    entities: [Customer, Consultation, Remboursement, Request],
    synchronize: true, // Set manually for dev or apply migrations later
    logging: true,     // Set to true for debug if needed
  });

  await tenantDataSource.initialize();
  tenantDataSources.set(tenantId, tenantDataSource);

  return tenantDataSource;
}

export function closeTenantDataSources(): Promise<void[]> {
  const closePromises = Array.from(tenantDataSources.values()).map(ds => ds.destroy());
  tenantDataSources.clear();
  return Promise.all(closePromises);
}
