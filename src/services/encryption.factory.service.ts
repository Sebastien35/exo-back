import { Injectable } from '@nestjs/common';
import { EncryptionService, EncryptedData } from './encryption.service';

@Injectable()
export class EncryptionFactoryService {
  private readonly key: Buffer;

  constructor(
    private readonly encryptionService: EncryptionService,
  ) {
  }

  encrypt(text: string): EncryptedData {
    return this.encryptionService.encrypt(text);
  }

  decrypt(payload: EncryptedData): string {
    return this.encryptionService.decrypt(payload);
  }

  hash(text: string): string {
    return this.encryptionService.hash(text);
  }
}
