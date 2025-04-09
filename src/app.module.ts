import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { TenantService } from './services/tenant.service';
import { EncryptionModule } from './modules/encryption.module';
import { EncryptionController } from './controllers/encryption.controller';
import { TenantController } from './controllers/tenant.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EncryptionModule,
  ],
  controllers: [EncryptionController, TenantController ],
  providers: [TenantService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
