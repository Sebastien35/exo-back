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
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../entity/customer.entity'; // Adjust the import path as necessary
import { CustomerLoginDto } from '../DTO/customerLogin.dto'; // Adjust the import path as necessary
import * as bcrypt from 'bcrypt';
import { getTenantDataSource } from '../databases/tenants.config'; // Adjust the import path as necessary
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from '../services/encryption.service'; // Adjust the import path as necessary
import { User } from 'src/entity/user.entity';
import { JwtAuthGuard } from '../guard/jw-auth.guard'; // Adjust the import path as necessary
import { UseGuards } from '@nestjs/common';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  // Protected route
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<{ id: string; name: string; email: string, lastname: string }[]> {
    const user: User = req.user;

    if (user.role !== 'admin') {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }

    if (!user.tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);

    const customers = await customerRepository.find();
    let returnData: { id: string; name: string; email: string, lastname: string }[] = [];
    let customerObject = [
      {
        id: 'string',
        name: 'string',
        email: 'string',
        lastname: 'string',  
      },
    ];
    for (const customer of customers) {
      customerObject[0].id = customer.id;
      customerObject[0].name = customer.name;
      customerObject[0].email = customer.email;
      customerObject[0].lastname = customer.lastname;
      returnData.push({ id: customerObject[0].id, name: customerObject[0].name, email: customerObject[0].email, lastname: customerObject[0].lastname });
    }
    return returnData;
    
  }

  // Protected route
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req): Promise<Customer> {
    const user = req.user;
    if (!['admin', 'superadmin'].includes(user.role) && user.id !== id) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    const encryptionService = new EncryptionService(); // Assuming you have an EncryptionService for encryption
    if (!user.tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }
    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);
    const customer = await customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    customer.numero_ss = customer.numero_ss ? encryptionService.decrypt(JSON.parse(customer.numero_ss)) as string : '';
    customer.rib = customer.rib ? encryptionService.decrypt(JSON.parse(customer.rib)) as string : '';
    customer.address = customer.address ? encryptionService.decrypt(JSON.parse(customer.address)) as string : '';

    return customer;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body: Partial<Customer>): Promise<Customer> {
    const user: User = req.user;
    console.log('User:', user);

    if (!user.tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    const tenantDataSource = await getTenantDataSource(user.tenantId);
    const customerRepository = tenantDataSource.getRepository(Customer);
    const encryptionService = new EncryptionService(); // Assuming you have an EncryptionService for encryption

    const hashPassword = await bcrypt.hash(body.passwordHash, 10);
    const cSS = body.numero_ss ? encryptionService.encrypt(body.numero_ss) : null;
    const cRIB = body.rib ? encryptionService.encrypt(body.rib) : null;
    const cAddress = body.address ? encryptionService.encrypt(body.address) : null;

    body.numero_ss = cSS ? JSON.stringify(cSS) : undefined;
    body.rib = cRIB ? JSON.stringify(cRIB) : undefined;
    body.address = cAddress ? JSON.stringify(cAddress) : undefined;
    body.rib = cRIB ? JSON.stringify(cRIB) : undefined;

    const existingCustomer = await customerRepository.findOne({
      where: { email: body.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    body.passwordHash = hashPassword;
    const newCustomer = customerRepository.create(body);
    return await customerRepository.save(newCustomer);
  }


  // Protected route
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updates: Partial<Customer>): Promise<Customer> {
    return this.customerService.update(id, updates);
  }

  // Protected route
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.customerService.delete(id);
    return { message: 'Customer deleted successfully' };
  }

  // Public route (no guard)
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

