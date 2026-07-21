import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type IntentoTest = {
  fecha: Date;
  respuestas: Record<string, any>;
  puntajeTotal: number;
  diagnostico: string;
  desglose: Record<string, any>;
  alertaCritica?: boolean;
};

@Schema({ collection: 'test_asignaciones', timestamps: true })
export class AsignacionTest extends Document {
  @Prop({ required: true })
  pacienteId!: string;

  @Prop({ required: true })
  psicologoId!: string;

  @Prop({ required: true, enum: ['TENDENCIAS_PERSONALES', 'BIENESTAR_ACTUAL'] })
  tipoTest!: string;

  @Prop({ required: true, enum: ['ACTIVO', 'COMPLETADO', 'INACTIVO'], default: 'INACTIVO' })
  estado!: string;

  @Prop({ type: [{ 
    fecha: { type: Date, default: Date.now },
    respuestas: { type: MongooseSchema.Types.Mixed },
    puntajeTotal: { type: Number },
    diagnostico: { type: String },
    desglose: { type: MongooseSchema.Types.Mixed },
    alertaCritica: { type: Boolean, default: false }
  }], default: [] })
  intentos!: IntentoTest[];

  @Prop({ default: 0 })
  numeroIntentos!: number;

  @Prop({ default: false })
  nuevoResultado!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AsignacionTestSchema = SchemaFactory.createForClass(AsignacionTest);