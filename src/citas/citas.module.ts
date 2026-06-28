import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Pago } from './pago.entity';
import { SesionClinica } from './sesion-clinica.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, Agenda, Pago, SesionClinica]), 
  ],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}