// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/user.entity';  // Adjust the import path as necessary
import { CentralDataSource } from '../databases/centralDB.config';  // Central DB data source
import { Tenant } from '../entity/tenant.entity';  // Adjust the import path as necessary

@Injectable()
export class AuthService {
  private userRepository: Repository<User>;
  private tenantRepository: Repository<Tenant>;

  constructor(
    private readonly jwtService: JwtService,
  ) {
    // Initialize repositories from CentralDataSource
    this.userRepository = CentralDataSource.getRepository(User);
    this.tenantRepository = CentralDataSource.getRepository(Tenant);
  }

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],  // To load tenant if needed
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password hash
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // Login and return a JWT token
  async login(user: User) {
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register a new user
  async register(email: string, password: string, tenantId: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      tenantId,
      role: 'user',  // Default role, can be customized
    });

    await this.userRepository.save(newUser);
    return newUser;
  }

  // Hash password (helper for registration)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
