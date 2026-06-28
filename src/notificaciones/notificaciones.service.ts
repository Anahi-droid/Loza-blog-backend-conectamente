import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notificacion, NotificacionDocument } from './schemas/notificacion.schema';
import { CreateNotificacionDto } from './dto/create-notificacione.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectModel(Notificacion.name)
    private readonly notificacionModel: Model<NotificacionDocument>,
  ) {}

  async create(createNotificacionDto: CreateNotificacionDto): Promise<Notificacion> {
    const nuevaNotificacion = new this.notificacionModel(createNotificacionDto);
    return await nuevaNotificacion.save();
  }

  async findByUsuario(usuarioId: string): Promise<Notificacion[]> {
    return await this.notificacionModel.find({ usuarioId }).sort({ createdAt: -1 }).exec();
  }

  async marcarComoLeida(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionModel.findByIdAndUpdate(
      id,
      { leido: true },
      { new: true },
    ).exec();

    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    return notificacion;
  }

  async findOne(id: string): Promise<Notificacion | null> {
    return this.notificacionModel.findById(id).exec();
  }

  async findAll(): Promise<Notificacion[]> {
    return this.notificacionModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(id: string, dto: any): Promise<Notificacion> {
    const notificacion = await this.notificacionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!notificacion) throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    return notificacion;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.notificacionModel.findByIdAndDelete(id).exec();
    return { deleted: !!res };
  }
}
