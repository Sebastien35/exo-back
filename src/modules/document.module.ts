// src/modules/document.module.ts (ou équivalent)
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../entity/document.entity';
import { DocumentService } from '../services/document.service';
import { DocumentController } from '../controllers/document.controller';
import { JwtAuthGuard } from '../services/auth.guard';


@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    JwtModule.register({}),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, JwtAuthGuard],
})
export class DocumentModule {}
