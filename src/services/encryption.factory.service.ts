import { Injectable, Scope, Inject } from '@nestjs/common';
import { Request } from 'express';
import { EncryptionService, EncryptedData } from './encryption.service';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class EncryptionFactoryService {
  private readonly keysPerTenant: Record<string, string> = {
    tenant1: process.env.KEY_TENANT1!,
    tenant2: process.env.KEY_TENANT2!,
  };

  constructor(
    private readonly encryptionService: EncryptionService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private getTenantKey(): Buffer {
    const tenantId = (this.request as any).tenantId;
    const keyHex = this.keysPerTenant[tenantId];
    if (!keyHex) throw new Error(`Clé AES non trouvée pour tenant ${tenantId}`);
    return Buffer.from(keyHex, 'hex');
  }

  encrypt(text: string): EncryptedData {
    return this.encryptionService.encrypt(text, this.getTenantKey());
  }

  decrypt(payload: EncryptedData): string {
    return this.encryptionService.decrypt(payload, this.getTenantKey());
  }

  hash(text: string): string {
    return this.encryptionService.hash(text);
  }
}
