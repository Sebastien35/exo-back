// src/database/typeorm-tenant.service.ts
import { Injectable, Scope, Inject } from '@nestjs/common';
import { DataSource, ObjectLiteral } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { User } from '../entity/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class TypeOrmTenantService {
  private dataSource: DataSource;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async getDataSource(): Promise<DataSource> {
    if (this.dataSource && this.dataSource.isInitialized) return this.dataSource;

    const tenantId = (this.request as any).tenantId;

    const dbUrls: Record<string, string> = {
      tenant1: process.env.DATABASE_URL_TENANT1!,
      tenant2: process.env.DATABASE_URL_TENANT2!,
    };

    const url = dbUrls[tenantId];
    if (!url) throw new Error(`Aucune URL de base trouvée pour le tenant ${tenantId}`);

    this.dataSource = new DataSource({
      type: 'mariadb',
      url,
      entities: [User],
      synchronize: true,
    });

    return this.dataSource.initialize();
  }

  async getRepository<T extends ObjectLiteral>(entity: any) {
    const ds = await this.getDataSource();
    return ds.getRepository<T>(entity);
  }
}
