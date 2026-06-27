import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificacionDocument = Notificacion & Document;

@Schema({ timestamps: true }) 
export class Notificacion {
  @Prop({ required: true })
  usuarioId?: string; 

  @Prop({ required: true })
  titulo?: string;

  @Prop({ required: true })
  mensaje?: string;

  @Prop({ type: String, enum: ['INFO', 'ALERTA', 'CITA'], default: 'INFO' })
  tipo?: string;

  @Prop({ default: false })
  leido?: boolean;
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);