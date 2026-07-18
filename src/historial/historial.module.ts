import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';
import { Historial } from './historial.entity';
import { Diagnostico } from './diagnostico.entity'; 
import { Tratamiento } from './tratamiento.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Historial, Diagnostico, Tratamiento]) 
  ], 
  controllers: [HistorialController],
  providers: [HistorialService],
  // 🚀 EXPORTS CORREGIDO: Compartimos el TypeOrmModule para que Citas pueda usar el HistorialRepository
  exports: [HistorialService, TypeOrmModule], 
})
export class HistorialModule {}