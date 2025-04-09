import { Injectable } from '@nestjs/common';
import { Tenant } from './tenant.interface';

@Injectable()
export class TenantService {
  private tenants: Map<string, Tenant> = new Map();

  constructor() {
    // Initialize with some sample tenants
    this.tenants.set('tenant1', {
      id: 'tenant1',
      name: 'Tenant 1',
      database: 'tenant1_db'
    });
    
    this.tenants.set('tenant2', {
      id: 'tenant2',
      name: 'Tenant 2',
      database: 'tenant2_db'
    });
  }

  async getTenantById(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }
}