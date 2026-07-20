import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PsicologosService } from './psicologos.service';
import { PsicologosController } from './psicologos.controller';
import { Psicologo } from './psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { EspecialidadesModule } from '../especialidades/especialidades.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Psicologo, Usuario]), 
    EspecialidadesModule,
  ],
  controllers: [PsicologosController],
  providers: [PsicologosService],
  exports: [PsicologosService], 
})
export class PsicologosModule {}