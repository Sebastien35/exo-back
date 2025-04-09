import { Module, Global } from '@nestjs/common';
import { EncryptionService } from '../services/encryption.service';
import { EncryptionFactoryService } from '../services/encryption.factory.service';

@Global()
@Module({
  providers: [EncryptionService, EncryptionFactoryService],
  exports: [EncryptionFactoryService],
})
export class EncryptionModule {}
