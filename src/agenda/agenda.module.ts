import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendasService } from './agenda.service';
import { AgendasController } from './agenda.controller';
import { Agenda } from './agenda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agenda]), 
  ],
  controllers: [AgendasController],
  providers: [AgendasService],
  exports: [AgendasService], 
})
export class AgendasModule {}