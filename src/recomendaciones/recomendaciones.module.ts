import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionesService } from './recomendaciones.service';
import { RecomendacionesController } from './recomendaciones.controller';
import { Recomendacion } from './recomendacion.entity';
import { Progreso } from '../progreso/progreso.entity';
import { Paciente } from '../pacientes/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recomendacion, Progreso, Paciente]) 
  ],
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService],
  exports: [RecomendacionesService],
})
export class RecomendacionesModule {}
