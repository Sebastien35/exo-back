// src/services/user.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(email: string, password: string, tenantId: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, passwordHash, tenantId, role: 'admin' });
    return this.userRepository.save(user);
  }

  async createRawUser(email: string, passwordHash: string, tenantId: string | null, role: 'admin' | 'superadmin'): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }
  
    const user = this.userRepository.create({ email, passwordHash, tenantId, role });
    return this.userRepository.save(user);
  }
  

  async findAllByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({ where: { tenantId } });
  }

  async findByIdAndTenant(id: string, tenantId: string | null): Promise<User> {
    const whereCondition = tenantId
      ? { id, tenantId }
      : { id, tenantId: IsNull() };
  
    const user = await this.userRepository.findOne({ where: whereCondition });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    return user;
  }
  

  async updateUser(id: string, updates: Partial<User>, currentUser: User): Promise<User> {
    const user = await this.findByIdAndTenant(id, currentUser.tenantId);
    if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
      throw new UnauthorizedException('Not authorized to update this user');
    }
    Object.assign(user, updates);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string, currentUser: User): Promise<{ message: string }> {
    const user = await this.findByIdAndTenant(id, currentUser.tenantId);
    if (currentUser.role !== 'admin' && currentUser.id !== user.id) {
      throw new UnauthorizedException('Not authorized to delete this user');
    }
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }
}
