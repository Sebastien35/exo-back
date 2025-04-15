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
import { CreateAdminDto } from '../DTO/createAdmin.dto';
import { CreateSuperadminDto } from '../DTO/createSuperadmin.dto';
import { JwtAuthGuard } from '../guard/jw-auth.guard';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 🔐 Créer un superadmin (accessible sans token)
  @Post('register-superadmin')
  async createSuperadmin(@Body() body: CreateSuperadminDto) {
    const passwordHash = await bcrypt.hash(body.password, 10);
    return this.userService.createRawUser(body.email, passwordHash, null, 'superadmin');
  }
  
  

  // 🔐 Créer un admin (réservé aux superadmins)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAdmin(@Body() body: CreateAdminDto, @Request() req) {
    if (req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmins can create admins');
    }
    return this.userService.createUser(body.email, body.password, body.tenantId);
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
  async update(@Param('id') id: string, @Body() body: Partial<CreateAdminDto>, @Request() req) {
    return this.userService.updateUser(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.userService.deleteUser(id, req.user);
  }
}
