import { Module } from '@nestjs/common';
import { ConsultationService } from '../services/consultation.service';
import { ConsultationController } from '../controllers/consultation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from '../entity/consultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation])],
  providers: [ConsultationService],
  controllers: [ConsultationController],
})
export class ConsultationModule {}
