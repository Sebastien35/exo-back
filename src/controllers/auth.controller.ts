// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAdminDto } from '../DTO/createAdmin.dto';
import { CreateSuperadminDto } from '../DTO/createSuperadmin.dto';
import { TenantService } from '../services/tenant.service';
import { getTenantDataSource } from 'src/databases/tenants.config';
import { CreateUserDto } from '../DTO/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantService: TenantService,
  ) {}

  @Post('login')
  async login(@Body() body: CreateUserDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}
