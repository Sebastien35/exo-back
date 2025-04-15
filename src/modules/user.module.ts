// src/modules/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../entity/user.entity';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { JwtAuthGuard } from '../guard/jw-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, JwtAuthGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
