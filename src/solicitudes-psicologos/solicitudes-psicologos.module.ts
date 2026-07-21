import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudPsicologo } from './solicitud-psicologo.entity';
import { SolicitudesPsicologosController } from './solicitudes-psicologos.controller';
import { SolicitudesPsicologosService } from './solicitudes-psicologos.service';
import { Usuario } from '../usuarios/usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudPsicologo, Usuario, Psicologo]),
  ],
  controllers: [SolicitudesPsicologosController],
  providers: [SolicitudesPsicologosService],
  exports: [SolicitudesPsicologosService],
})
export class SolicitudesPsicologosModule {}