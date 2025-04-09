import { Controller, Post, Body } from '@nestjs/common';
import { EncryptionFactoryService } from '../services/encryption.factory.service';
import { EncryptedData } from '../services/encryption.service';

@Controller('crypto')
export class EncryptionController {
  constructor(private readonly crypto: EncryptionFactoryService) {}

  @Post('encrypt')
  encrypt(@Body('data') data: string) {
    const encrypted = this.crypto.encrypt(data);
    const hash = this.crypto.hash(data);
    return { ...encrypted, hash };
  }

  @Post('decrypt')
  decrypt(@Body() body: EncryptedData) {
    return this.crypto.decrypt(body);
  }
}
