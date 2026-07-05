import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EncuestasService } from './encuestas.service';
import { EncuestasController } from './encuestas.controller';
import { Encuesta, EncuestaSchema } from './schemas/encuesta.schema';
import { Respuesta, RespuestaSchema } from './schemas/respuesta.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Encuesta.name, schema: EncuestaSchema },
      { name: Respuesta.name, schema: RespuestaSchema },
    ]),
    AuthModule,
  ],
  controllers: [EncuestasController],
  providers: [EncuestasService],
  exports: [EncuestasService],
})
export class EncuestasModule {}