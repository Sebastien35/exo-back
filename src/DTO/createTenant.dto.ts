// src/dto/CreateTenantDto.ts
export class CreateTenantDto {
    name: string;
    description?: string;
    dbHost?: string;
    dbPort?: number;
    dbUsername?: string;
    dbPassword?: string;
    dbName?: string;
    adminEmail: string;
    adminPassword: string;
  }