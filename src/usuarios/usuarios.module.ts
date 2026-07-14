import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity'; // Importación limpia de la entidad
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Psicologo])], // Ambos repositorios listos
  controllers: [UsuariosController], 
  providers: [UsuariosService],
  exports: [UsuariosService], 
})
export class UsuariosModule {}