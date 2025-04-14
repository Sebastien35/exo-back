import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { CustomerService } from '../services/customer.service';
  import { Customer } from '../entity/customer.entity'; // Adjust the import path as necessary
  
  @Controller('customers')
  export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}
  
    // GET /customers
    @Get()
    async findAll(): Promise<Customer[]> {
      return this.customerService.findAll();
    }
  
    // GET /customers/:id
    @Get(':id')
    async findById(@Param('id') id: string): Promise<Customer> {
      return this.customerService.findById(id);
    }
  
    // POST /customers
    @Post()
    async create(@Body() body: Partial<Customer>): Promise<Customer> {
        console.log('Creating customer:', body); // Debugging line
      return this.customerService.create(body);
    }
  
    // PUT /customers/:id
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() updates: Partial<Customer>,
    ): Promise<Customer> {
      return this.customerService.update(id, updates);
    }
  
    // DELETE /customers/:id
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      await this.customerService.delete(id);
      return { message: 'Customer deleted successfully' };
    }
  }
  