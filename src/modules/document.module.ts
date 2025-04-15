// src/modules/document/document.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../entity/document.entity';
import { DocumentService } from '../services/document.service';
import { DocumentController } from '../controllers/document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
