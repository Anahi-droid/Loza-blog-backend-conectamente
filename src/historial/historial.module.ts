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
  exports: [HistorialService],
})
export class HistorialModule {}