import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { Notificacion, NotificacionSchema } from './schemas/notificacion.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Cita } from '../citas/cita.entity';
import { RecordatoriosCitasCron } from './recordatorios-citas.cron';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notificacion.name, schema: NotificacionSchema }]),
    TypeOrmModule.forFeature([Cita]),
    AuthModule,
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, RecordatoriosCitasCron],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}