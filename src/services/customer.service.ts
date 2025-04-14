import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entity/customer.entity'; // Adjust the import path as necessary
import { EncryptionService } from './encryption.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // Find all customers
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  // Find one by ID
  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

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
    
    const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
    const newCustomer = this.customerRepository.create({
      ...data,
      passwordHash: hashedPassword,
    });
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
}
