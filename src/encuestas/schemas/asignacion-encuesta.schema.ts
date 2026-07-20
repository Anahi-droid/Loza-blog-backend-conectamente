import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AsignacionEncuestaDocument = HydratedDocument<AsignacionEncuesta>;

@Schema({ timestamps: true })
export class AsignacionEncuesta {
  @Prop({ type: Types.ObjectId, ref: 'Encuesta', required: true })
  encuestaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  psicologoId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  pacienteId?: Types.ObjectId;

  @Prop({ required: true, enum: ['PENDIENTE', 'RESPONDIDA'], default: 'PENDIENTE' })
  estado?: string;

  @Prop()
  fechaRespuesta?: Date;
}

export const AsignacionEncuestaSchema = SchemaFactory.createForClass(AsignacionEncuesta);