import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudVinculacion } from './solicitud-vinculacion.entity';
import { PacientesModule } from '../pacientes/pacientes.module'; // 👈 IMPORTADO

@Module({
  imports: [
    // Registramos la entidad propia del módulo y traemos la configuración limpia de Pacientes
    TypeOrmModule.forFeature([SolicitudVinculacion]),
    PacientesModule, // 👈 🎯 CLAVE: Consume el repositorio exportado limpiamente
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
})
export class SolicitudesModule {}