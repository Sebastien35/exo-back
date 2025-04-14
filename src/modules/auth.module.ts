// src/auth/auth.module.ts
import * as dotenv from 'dotenv';
dotenv.config();  // Ensure dotenv is loaded at the top

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { User } from '../entity/user.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard'; // Adjust the import path as necessary
import { TenantService } from '../services/tenant.service'; // Adjust the import path as necessary
import { EncryptionService } from '../services/encryption.service'; // Adjust the import path as necessary

console.log('JWT_SECRET in AuthModule:', process.env.JWT_SECRET);  // Debugging line

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',  // Ensure secret is loaded from env
      signOptions: { expiresIn: '1h' },  // Customize token expiration if needed
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, TenantService, EncryptionService],  // Include TenantService if needed
  exports: [AuthService, JwtModule, JwtAuthGuard],  // Export AuthService and JwtModule if needed in other modules
})
export class AuthModule {}
