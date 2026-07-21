import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EncuestaDocument = HydratedDocument<Encuesta>;

@Schema({ timestamps: true })
export class Encuesta {
  @Prop({ required: true })
  titulo?: string;

  @Prop({ required: true })
  descripcion?: string;

  @Prop({ required: true })
  psicologoId?: string;

  @Prop([
    {
      pregunta: String,
      tipo: { type: String, enum: ['TEXTO', 'ESCALA', 'MULTIPLE'] },
      opciones: [String]
    }
  ])
  preguntas?: Array<{ pregunta: string; tipo: string; opciones?: string[] }>;
}

export const EncuestaSchema = SchemaFactory.createForClass(Encuesta);