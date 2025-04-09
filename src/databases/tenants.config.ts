// src/databases/tenantLoader.ts
import { DataSource } from 'typeorm';
import { Tenant } from '../entity/tenant.entity'; // Adjust the import path as necessary
import { CentralDataSource } from './centralDB.config';


const tenantDataSources: Map<string, DataSource> = new Map();

export async function getTenantDataSource(tenantId: string): Promise<DataSource> {
  // Check if we already have a connection for this tenant
  if (tenantDataSources.has(tenantId)) {
    const ds = tenantDataSources.get(tenantId)!;
    if (ds.isInitialized) return ds;
  }

  // Fetch tenant connection details from central DB
  const tenant = await CentralDataSource.getRepository(Tenant).findOne({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`);
  }

  // Create new DataSource for this tenant
  const tenantDataSource = new DataSource({
    type: 'postgres',
    host: tenant.dbHost || process.env.TENANT_DB_HOST,
    port: tenant.dbPort || parseInt(process.env.TENANT_DB_PORT || '5432'),
    username: tenant.dbUser || process.env.TENANT_DB_USER,
    password: tenant.dbPassword || process.env.TENANT_DB_PASSWORD,
    database: tenant.dbName || `tenant_${tenantId}`,
    entities: [],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  });

  // Initialize and store the connection
  await tenantDataSource.initialize();
  tenantDataSources.set(tenantId, tenantDataSource);

  return tenantDataSource;
}

export function closeTenantDataSources(): Promise<void[]> {
  const closePromises = Array.from(tenantDataSources.values()).map(ds => ds.destroy());
  tenantDataSources.clear();
  return Promise.all(closePromises);
}