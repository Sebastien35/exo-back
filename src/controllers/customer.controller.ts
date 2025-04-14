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
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // 🔐 Protected route
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<Customer[]> {
    const user: User = req.user;
    const tenantId = user.tenantId;
    const tenantDataSource = await getTenantDataSource(tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);
    return await customerRepository.find();
  }

  // 🔐 Protected route
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findById(id);
  }

  // 🔐 Protected route
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body: Partial<Customer>): Promise<Customer> {
    const user: User = req.user;
    const tenantId = user.tenantId;
    const tenantDataSource = await getTenantDataSource(tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);
    const hashPassword = await bcrypt.hash(body.passwordHash, 10);
    const existingCustomer = await customerRepository.findOne({ where: { email: body.email } });
    if(existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }
    body.passwordHash = hashPassword;
    const newCustomer = customerRepository.create(body);
    return await customerRepository.save(newCustomer);
  }

  // 🔐 Protected route
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: Partial<Customer>): Promise<Customer> {
    return this.customerService.update(id, updates);
  }

  // 🔐 Protected route
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.customerService.delete(id);
    return { message: 'Customer deleted successfully' };
  }

  // 🚫 Public route (no guard)
  @Post('/login')
  async customerLogin(@Body() body: CustomerLoginDto) {
    const { tenantId, email, password } = body;

    const tenantDataSource = await getTenantDataSource(tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);
    const customer = await customerRepository.findOne({ where: { email } });

    if (!customer) {
      return { message: 'Customer not found' };
    }

    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
    const token = jwtService.sign({ id: customer.id, email: customer.email, tenantId });

    return {
      message: 'Login successful',
      token,
    };
  }
}

  