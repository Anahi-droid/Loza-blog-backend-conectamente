import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity'; 
import { Cita } from '../citas/cita.entity'; // 🎯 IMPORTADO
import { Psicologo } from '../psicologos/psicologo.entity'; // 🎯 IMPORTADO

@Module({
  imports: [
    // 🎯 REPOSITORIOS REGISTRADOS: Agregamos Cita y Psicologo para que el servicio los use sin romper
    TypeOrmModule.forFeature([Paciente, Usuario, Cita, Psicologo]), 
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}