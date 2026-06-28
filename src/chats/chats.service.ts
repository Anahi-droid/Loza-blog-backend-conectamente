import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

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

  // 🚀 CORREGIDO: Se cambia el retorno a Promise<Chat | null> para permitir retornar null en modo estricto
  async actualizarMensaje(remitenteId: string, mensajeId: string, updateDto: UpdateChatDto): Promise<Chat | null> {
    const mensaje = await this.chatModel.findById(mensajeId).exec();
    
    // Si no se encuentra el mensaje, la salida es válida
    if (!mensaje) return null;
    
    // 🚀 CORREGIDO: Uso de encadenamiento opcional (?.) para mitigar posibles valores indefinidos
    if (mensaje.remitenteId?.toString() !== remitenteId) return null;
    
    if (updateDto.mensaje !== undefined) mensaje.mensaje = updateDto.mensaje;
    return mensaje.save();
  }

  async eliminarMensaje(remitenteId: string, mensajeId: string): Promise<{ deleted: boolean }> {
    const mensaje = await this.chatModel.findById(mensajeId).exec();
    if (!mensaje) return { deleted: false };
    
    // 🚀 CORREGIDO: Uso de encadenamiento opcional (?.) para evitar el error de 'possibly undefined'
    if (mensaje.remitenteId?.toString() !== remitenteId) {
      return { deleted: false };
    }
    
    await this.chatModel.findByIdAndDelete(mensajeId).exec();
    return { deleted: true };
  }
}