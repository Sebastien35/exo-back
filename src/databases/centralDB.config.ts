// src/databases/centralDB.config.ts
import { DataSource } from 'typeorm';
import { Tenant } from '../entity/tenant.entity'; // Adjust the import path as necessary
import { User } from '../entity/user.entity'; // Adjust the import path as necessary
import 'dotenv/config'; 


export const CentralDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.CENTRAL_DB_HOST || 'localhost',
  port: parseInt(process.env.CENTRAL_DB_PORT || '3306'),
  username: process.env.CENTRAL_DB_USER || 'root',
  password: process.env.CENTRAL_DB_PASSWORD || '',
  database: process.env.CENTRAL_DB_NAME || 'central_db',
  entities: [Tenant, User],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});