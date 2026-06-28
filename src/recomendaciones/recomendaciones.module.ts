import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionesService } from './recomendaciones.service';
import { RecomendacionesController } from './recomendaciones.controller';
import { Recomendacion } from './recomendacion.entity';
import { Progreso } from '../progreso/progreso.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Recomendacion, Progreso]) 
  ],
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService],
  exports: [RecomendacionesService],
})
export class RecomendacionesModule {}