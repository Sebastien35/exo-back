import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { TenantMiddleware } from '../tenant/tenant.middleware';
import { TenantService } from '../tenant/tenant.service';
import { EncryptionModule } from './modules/encryption.module';
import { EncryptionController } from './controllers/encryption.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EncryptionModule,
  ],
  controllers: [EncryptionController],
  providers: [TenantService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
