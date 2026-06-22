import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HistorialModule } from './historial/historial.module';
import { ProgresoModule } from './progreso/progreso.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';

@Module({
  imports: [HistorialModule, ProgresoModule, RecomendacionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
