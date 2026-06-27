// src/agenda/agenda.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendasService } from './agenda.service';
import { AgendasController } from './agenda.controller';
import { Agenda } from './agenda.entity';
import { DisponibilidadExcepcion } from '../psicologos/disponibilidad-excepcion.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Agenda, DisponibilidadExcepcion]), 
  ],
  controllers: [AgendasController],
  providers: [AgendasService],
  exports: [AgendasService],
})
export class AgendaModule {}