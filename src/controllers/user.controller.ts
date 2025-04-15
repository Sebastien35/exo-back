import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../DTO/createUser.dto';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🔐 Créer un superadmin (accessible sans token)
  @Post('register-superadmin')
  async createSuperadmin(@Body() body: CreateUserDto) {
    const user = await this.userService.createUser(
      body.email,
      body.password,
      null,
      'superadmin',)
    return user;
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAdmin(@Body() body: CreateUserDto, @Request() req) {
    if (req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmins can create admins');
    }
    return this.userService.createUser(body.email, body.password, body.tenantId ?? null, 'admin'); // ⚠️ body.tenantId ici
  }
  

  // 🔐 Voir tous les utilisateurs du tenant (réservé aux admins)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    return this.userService.findAllByTenant(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.userService.findByIdAndTenant(id, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<CreateUserDto>, @Request() req) {
    return this.userService.updateUser(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.userService.deleteUser(id, req.user);
  }
}
