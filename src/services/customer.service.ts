import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Customer } from '../entity/customer.entity'; // Adjust the import path as necessary
import { EncryptionService } from './encryption.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly encryptionService: EncryptionService,
  ) {}

  
  // Find one by email
  async findByEmail(email: string): Promise<Customer | null> {
    try {
      return await this.customerRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw new Error('Database error');
    }
  }

  // Create a new customer
  async create(data: Partial<Customer>): Promise<Customer> {
    if (!data.email) {
      throw new ConflictException('Email is required');
    }
  
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  
    const encryptedData: DeepPartial<Customer> = {
      ...data,
      passwordHash: await bcrypt.hash(data.passwordHash, 10),
      rib: data.rib ? JSON.stringify(await this.encryptionService.encrypt(data.rib)) : undefined,
      numero_ss: data.numero_ss ? JSON.stringify(await this.encryptionService.encrypt(data.numero_ss)) : undefined,
      address: data.address ? JSON.stringify(await this.encryptionService.encrypt(data.address)) : undefined,
      phone: data.phone ? JSON.stringify(await this.encryptionService.encrypt(data.phone)) : undefined,
    };
  
    const newCustomer = this.customerRepository.create(encryptedData);
    return this.customerRepository.save(newCustomer);
  }

  // Update a customer
  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customer = await this.findById(id);

    if (updates.passwordHash) {
      updates.passwordHash = await bcrypt.hash(updates.passwordHash, 10);
    }

    Object.assign(customer, updates);
    return this.customerRepository.save(customer);
  }

  // Delete a customer
  async delete(id: string): Promise<void> {
    const customer = await this.findById(id);
    await this.customerRepository.remove(customer);
  }

  private async decryptCustomerFields(customer: Customer): Promise<Customer> {
    const decryptedCustomer = { ...customer };
  
    if (typeof decryptedCustomer.rib === 'string') {
      try {
        decryptedCustomer.rib = await this.encryptionService.decrypt(
          JSON.parse(decryptedCustomer.rib)
        );
      } catch (err) {
        console.error('Error decrypting rib:', err);
      }
    }
  
    if (typeof decryptedCustomer.numero_ss === 'string') {
      try {
        decryptedCustomer.numero_ss = await this.encryptionService.decrypt(
          JSON.parse(decryptedCustomer.numero_ss)
        );
      } catch (err) {
        console.error('Error decrypting numero_ss:', err);
      }
    }
  
    if (typeof decryptedCustomer.address === 'string') {
      try {
        decryptedCustomer.address = await this.encryptionService.decrypt(
          JSON.parse(decryptedCustomer.address)
        );
      } catch (err) {
        console.error('Error decrypting address:', err);
      }
    }
  
    if (typeof decryptedCustomer.phone === 'string') {
      try {
        decryptedCustomer.phone = await this.encryptionService.decrypt(
          JSON.parse(decryptedCustomer.phone)
        );
      } catch (err) {
        console.error('Error decrypting phone:', err);
      }
    }
  
    return decryptedCustomer;
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.customerRepository.find();
    return Promise.all(customers.map(c => this.decryptCustomerFields(c)));
  }
  
  // Return one customer, decrypted
  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.decryptCustomerFields(customer);
  }
}
