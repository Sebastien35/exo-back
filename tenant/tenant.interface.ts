export interface Tenant {
    id: string;
    name: string;
    database: string;
  }
  
  export interface TenantContext {
    tenant: Tenant;
  }