import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantService } from './services/tenant.service';
import { EncryptionService } from './services/encryption.service';
import { AuthService } from './services/auth.service';

import { EncryptionModule } from './modules/encryption.module';
import { CustomerModule } from './modules/customer.module';
import { ConsultationModule } from './modules/consultation.module';

import { EncryptionController } from './controllers/encryption.controller';
import { TenantController } from './controllers/tenant.controller';
import { AuthController } from './controllers/auth.controller';
import { CustomerController } from './controllers/customer.controller';

import { User } from './entity/user.entity';
import { Tenant } from './entity/tenant.entity';
import { Consultation } from './entity/consultation.entity';

import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      url: process.env.CENTRAL_DB_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Tenant, Consultation]),
    EncryptionModule,
    CustomerModule,
    ConsultationModule,
  ],
  controllers: [
    EncryptionController,
    TenantController,
    AuthController,
    CustomerController,
  ],
  providers: [
    TenantService,
    AuthService,
    JwtService,
    EncryptionService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
