// test/integration/tenantDatabase.test.ts
import { getTenantDataSource } from '../databases/tenants.config';
import { CentralDataSource } from '../databases/centralDB.config';
import { Tenant } from '../entity/tenant.entity'; // Adjust the import path as necessary
import { User } from '../entity/user.entity';
import { TestDataSource } from './test-databaseConfig.spec';

describe('Tenant Database Switching', () => {
  let testTenant: Tenant;

  beforeAll(async () => {
    await CentralDataSource.initialize();
    
    // Create a test tenant
    testTenant = new Tenant();
    testTenant.name = 'Integration Test Tenant';
    testTenant.dbName = process.env.TEST_TENANT_DB_NAME || 'test_tenant_integration';
    // Add other required connection details...
    await CentralDataSource.manager.save(testTenant);
  });

  afterAll(async () => {
    await CentralDataSource.getRepository(Tenant).delete(testTenant.id);
    await CentralDataSource.destroy();
  });

  it('should connect to tenant-specific database', async () => {
    const tenantDataSource = await getTenantDataSource(testTenant.id);
    
    expect(tenantDataSource).toBeDefined();
    expect(tenantDataSource.isInitialized).toBeTruthy();
    
    // Verify you can perform operations on tenant DB
    const result = await tenantDataSource.query('SELECT 1 as test');
    expect(result[0].test).toBe(1);
    
    await tenantDataSource.destroy();
  });
});