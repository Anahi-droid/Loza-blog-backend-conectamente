import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'test_psicometricos_resultados', timestamps: { createdAt: 'fechaRealizacion', updatedAt: false } })
export class TestResultado extends Document {
  @Prop({ required: true })
  pacienteId?: string;

  @Prop({ required: true })
  tipoTest?: string; 

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  respuestas?: any; 

  @Prop({ required: true })
  puntajeTotal?: number;

  @Prop({ required: true })
  diagnosticoPreliminar?: string;

  fechaRealizacion?: Date;
}

export const TestResultadoSchema = SchemaFactory.createForClass(TestResultado);