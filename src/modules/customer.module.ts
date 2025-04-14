import { Module } from '@nestjs/common';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerService } from '../services/customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entity/customer.entity';
import { EncryptionService } from '../services/encryption.service';
import { AuthModule } from './auth.module'; // Only import the module, not services

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]), // For TypeORM repository
    AuthModule, // Import the entire AuthModule
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    EncryptionService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}