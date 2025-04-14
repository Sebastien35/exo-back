import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantService } from './services/tenant.service';
import { EncryptionModule } from './modules/encryption.module';
import { EncryptionController } from './controllers/encryption.controller';
import { TenantController } from './controllers/tenant.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { User } from './entity/user.entity'; // Adjust the import path as necessary
import { JwtService } from '@nestjs/jwt';
import { Tenant } from './entity/tenant.entity'; // Adjust the import path as necessary
import { EncryptionService } from './services/encryption.service';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      url: process.env.CENTRAL_DB_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Tenant]), 
    ConfigModule.forRoot({ isGlobal: true }),
    EncryptionModule,
    TypeOrmModule.forFeature([User]), // Add this to provide the UserRepository
  ],
  controllers: [EncryptionController, TenantController, AuthController],
  providers: [TenantService, AuthService, JwtService, EncryptionService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
