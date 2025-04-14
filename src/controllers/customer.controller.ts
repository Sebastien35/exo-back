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
    Request,
  } from '@nestjs/common';
  import { CustomerService } from '../services/customer.service';
  import { Customer } from '../entity/customer.entity'; // Adjust the import path as necessary
  import { CustomerLoginDto } from '../DTO/customerLogin.dto'; // Adjust the import path as necessary
  import * as bcrypt from 'bcrypt';
  import { getTenantDataSource } from '../databases/tenants.config'; // Adjust the import path as necessary
  import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entity/user.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard'; // Adjust the import path as necessary
import { UseGuards } from '@nestjs/common';

  

  @Controller('customers')
  @UseGuards(JwtAuthGuard)
  export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}
  
    @Get()
    async findAll(@Request() req): Promise<Customer[]> {
      try {
        const user: User = req.user; 
        const tenantId = user.tenantId; 
        
        // Get the tenant-specific data source
        const tenantDataSource = await getTenantDataSource(tenantId);
        
        // Get the customer repository from the tenant data source
        const customerRepository = tenantDataSource.getRepository(Customer);
        return await customerRepository.find();
      } catch (error) {
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }
    }
  
    // GET /customers/:id
    @Get(':id')
    async findById(@Param('id') id: string): Promise<Customer> {
      return this.customerService.findById(id);
    }
  
    // POST /customers
    @Post()
    async create(
      @Request() req,
      @Body() body: Partial<Customer>
    ): Promise<Customer> {
      try {
        const user: User = req.user;
        const tenantId = user.tenantId;

        console.log('Creating customer for tenant:', tenantId, body); // Debugging line

        // Get the tenant-specific data source
        const tenantDataSource = await getTenantDataSource(tenantId);
        
        // Get the customer repository from the tenant data source
        const customerRepository = tenantDataSource.getRepository(Customer);
        
        // Create and save the customer in the tenant database
        const newCustomer = customerRepository.create(body);
        return await customerRepository.save(newCustomer);
      } catch (error) {
        console.error('Error creating customer:', error);
        throw new Error(`Failed to create customer: ${error.message}`);
      }
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

    @Post('/login')
    async customerLogin(@Body() body: CustomerLoginDto) {
      const { tenantId, email, password } = body;
  
      // Step 1: Get tenant's data source
      const tenantDataSource = await getTenantDataSource(tenantId);
  
      // Step 2: Get the customer repository for the specific tenant database
      const customerRepository = tenantDataSource.getRepository(Customer);
  
      // Step 3: Find customer by email
      const customer = await customerRepository.findOne({ where: { email } });
      if(!customer) {
        return {
          message: 'Customer not found',
        };
      }
  
      // Step 4: Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
  
      // Step 5: Generate JWT token
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
      const token = jwtService.sign({ id: customer.id, email: customer.email });

      return {
        message: 'Login successful',
        token,
      };
    }
  }
  