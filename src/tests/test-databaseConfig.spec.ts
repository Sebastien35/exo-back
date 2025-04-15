// src/tests/testDatabase.config.ts
import { DataSource } from 'typeorm';
import { Tenant } from '../entity/tenant.entity';
import { User } from '../entity/user.entity';


export const TestDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3310'),
  username: process.env.TEST_DB_USER || 'your_test_user',
  password: process.env.TEST_DB_PASSWORD || 'your_test_password',   
  database: process.env.TEST_DB_NAME || 'test_db',
  entities: [Tenant, User],
  synchronize: true, // Only for tests!
  dropSchema: true,  // Clean database between test runs
  logging: false
});