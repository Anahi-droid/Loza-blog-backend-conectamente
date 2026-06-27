import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgresoService } from './progreso.service';
import { ProgresoController } from './progreso.controller';
import { Progreso } from './progreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Progreso])], 
  controllers: [ProgresoController],
  providers: [ProgresoService],
  exports: [ProgresoService],
})
export class ProgresoModule {}