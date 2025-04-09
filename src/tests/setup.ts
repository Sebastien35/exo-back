// src/tests/setup.ts
import { TestDataSource } from './test-databaseConfig.spec';

beforeAll(async () => {
  await TestDataSource.initialize();
});

afterAll(async () => {
  await TestDataSource.destroy();
});