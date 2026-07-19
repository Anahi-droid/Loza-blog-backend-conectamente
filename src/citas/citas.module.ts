import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Pago } from './pago.entity';
import { SesionClinica } from './sesion-clinica.entity';
import { HistorialModule } from '../historial/historial.module'; // 🚀 IMPORTACIÓN DEL MÓDULO CORREGIDA

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, Agenda, Pago, SesionClinica]), 
    HistorialModule, // 🚀 Al importar el módulo completo, la inyección del repositorio en CitasService se resuelve en automático
  ],
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService],
})
export class CitasModule {}