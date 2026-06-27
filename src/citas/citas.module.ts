import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './cita.entity';
import { Agenda } from '../agenda/agenda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, Agenda]), 
  ],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}