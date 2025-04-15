// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/user.entity';
import { CentralDataSource } from '../databases/centralDB.config';
import { Tenant } from '../entity/tenant.entity';

@Injectable()
export class AuthService {
  private userRepository: Repository<User>;
  private tenantRepository: Repository<Tenant>;

  constructor(
    private readonly jwtService: JwtService,
  ) {
    this.userRepository = CentralDataSource.getRepository(User);
    this.tenantRepository = CentralDataSource.getRepository(Tenant);
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    // First find without relations
    const user = await this.userRepository.findOne({
      where: { email }
    });
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Only load tenant relation for admin users
    if (user.role === 'admin') {
      await this.userRepository.findOne({
        where: { email },
        relations: ['tenant']
      });
    }
  
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    return user;
  }

  // Login and return a JWT token
  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'defaultSecretKey',
        expiresIn: '1h',
      }),
    };
  }

  // Register a new admin (only)
  async register(email: string, password: string, tenantId: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      tenantId,
      role: 'admin',
    });

    return this.userRepository.save(newUser);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
