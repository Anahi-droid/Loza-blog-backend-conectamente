import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async enviarMensaje(remitenteId: string, createChatDto: CreateChatDto): Promise<Chat> {
    const nuevoMensaje = new this.chatModel({
      remitenteId,
      ...createChatDto,
    });
    return nuevoMensaje.save();
  }

  async obtenerHistorial(usuarioA: string, usuarioB: string): Promise<Chat[]> {
    return this.chatModel.find({
      $or: [
        { remitenteId: usuarioA, destinatarioId: usuarioB },
        { remitenteId: usuarioB, destinatarioId: usuarioA },
      ],
    })
    .sort({ enviadoEn: 1 }) 
    .exec();
  }
}