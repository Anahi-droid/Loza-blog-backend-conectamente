import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity'; // Importa la entidad Usuario

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Usuario]), 
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}


