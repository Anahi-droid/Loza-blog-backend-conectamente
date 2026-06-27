import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RespuestaDocument = HydratedDocument<Respuesta>;

@Schema({ timestamps: true })
export class Respuesta {
  @Prop({ type: Types.ObjectId, ref: 'Encuesta', required: true })
  encuestaId?: Types.ObjectId;

  @Prop({ required: true })
  usuarioId?: string; // UUID de tu Postgres

  @Prop({ type: Object, required: true })
  respuestas?: Record<string, any>;
}

export const RespuestaSchema = SchemaFactory.createForClass(Respuesta);