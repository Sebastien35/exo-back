import { Module } from '@nestjs/common';
import { CustomerController } from '../controllers/customer.controller'; // adjust path as needed
import { CustomerService } from '../services/customer.service'; // adjust path as needed
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entity/customer.entity'; // adjust path as needed

@Module({
  imports: [TypeOrmModule.forFeature([Customer])], // inject the Customer entity
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService], // in case other modules need it
})
export class CustomerModule {}
