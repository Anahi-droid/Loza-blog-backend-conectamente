import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity'; 
import { Cita } from '../citas/cita.entity'; 
import { Psicologo } from '../psicologos/psicologo.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Usuario, Cita, Psicologo]), 
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [TypeOrmModule], // 👈 🎯 CLAVE: Exportamos el TypeOrmModule configurado para que Solicitudes lo herede
})
export class PacientesModule {}