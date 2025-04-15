import { Module } from '@nestjs/common';
import { RemboursementController } from '../controllers/remboursement.controller';
import { RemboursementService } from '../services/remboursement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Remboursement } from '../entity/remboursement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Remboursement])],
  controllers: [RemboursementController],
  providers: [RemboursementService],
})
export class RemboursementModule {}
