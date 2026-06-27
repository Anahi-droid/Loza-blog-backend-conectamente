import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'chats_interacciones', timestamps: { createdAt: 'enviadoEn', updatedAt: false } })
export class Chat extends Document {
  @Prop({ required: true })
  remitenteId?: string;

  @Prop({ required: true })
  destinatarioId?: string;

  @Prop({ required: true })
  mensaje?: string;

  @Prop({ default: false })
  leido?: boolean;

  enviadoEn?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);