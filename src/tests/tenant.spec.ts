// test/entities/Tenant.test.ts
import { CentralDataSource } from '../databases/centralDB.config';
import { TestDataSource } from './test-databaseConfig.spec';
import { Tenant } from '../entity/tenant.entity'
import { User } from '../entity/user.entity';


describe('Tenant Entity', () => {
  let testTenant: Tenant;

  beforeAll(async () => {
    await TestDataSource.initialize();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    // Clear data before each test
    await TestDataSource.synchronize(true);
  });

  it('should create a tenant with users', async () => {
    // Create and save tenant
    testTenant = new Tenant();
    testTenant.name = 'Test Tenant';
    testTenant.dbName = 'test_tenant_db';
    await TestDataSource.manager.save(testTenant);
    
    // Create and save user
    const user = new User();
    user.email = 'test@tenant.com';
    user.passwordHash = 'hashed_password';
    user.tenant = testTenant;
    await TestDataSource.manager.save(user);
    
    // Verify the result
    const savedTenant = await TestDataSource.getRepository(Tenant)
      .findOne({ 
        where: { id: testTenant.id }, 
        relations: ['users'] 
      });
    
    expect(savedTenant).toBeDefined();
    expect(savedTenant?.users).toHaveLength(1);
    expect(savedTenant?.users[0].email).toBe('test@tenant.com');
  });
});