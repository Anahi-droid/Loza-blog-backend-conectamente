import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Encuesta, EncuestaDocument } from './schemas/encuesta.schema';
import { Respuesta, RespuestaDocument } from './schemas/respuesta.schema';
import { UpdateEncuestaDto } from './dto/update-encuesta.dto'; // Asegúrate de importar esto

@Injectable()
export class EncuestasService {
  constructor(
    @InjectModel(Encuesta.name) private readonly encuestaModel: Model<EncuestaDocument>,
    @InjectModel(Respuesta.name) private readonly respuestaModel: Model<RespuestaDocument>,
  ) {}

  async create(createEncuestaDto: any): Promise<Encuesta> {
    const nuevaEncuesta = new this.encuestaModel(createEncuestaDto);
    return await nuevaEncuesta.save();
  }

  async findAll(): Promise<Encuesta[]> {
    return await this.encuestaModel.find().exec();
  }

  async findOne(id: string): Promise<Encuesta> {
    const encuesta = await this.encuestaModel.findById(id).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${id} no encontrada`);
    }
    return encuesta;
  }

  async update(id: string, updateEncuestaDto: UpdateEncuestaDto): Promise<Encuesta> {
    const encuestaExistente = await this.encuestaModel
      .findByIdAndUpdate(id, updateEncuestaDto, { new: true })
      .exec();
    
    if (!encuestaExistente) {
      throw new NotFoundException(`Encuesta con ID ${id} no encontrada para actualizar`);
    }
    return encuestaExistente;
  }

  async remove(id: string): Promise<any> {
    const resultado = await this.encuestaModel.findByIdAndDelete(id).exec();
    if (!resultado) {
      throw new NotFoundException(`Encuesta con ID ${id} no encontrada para eliminar`);
    }
    return { eliminado: true, id };
  }

  async guardarRespuesta(encuestaId: string, usuarioId: string, respuestas: any): Promise<Respuesta> {
    const nuevaRespuesta = new this.respuestaModel({
      encuestaId,
      usuarioId,
      respuestas,
    });
    return await nuevaRespuesta.save();
  }

  async obtenerRespuestasPorEncuesta(encuestaId: string): Promise<Respuesta[]> {
    return await this.respuestaModel.find({ encuestaId }).exec();
  }

  async obtenerMetricasGenerales(): Promise<any> {
    const totalEncuestas = await this.encuestaModel.countDocuments().exec();
    
    const totalRespuestas = await this.respuestaModel.countDocuments().exec();

    const respuestasPorEncuesta = await this.respuestaModel
      .aggregate([
        {
          $group: {
            _id: '$encuestaId',
            cantidad: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'encuestas',
            localField: '_id',
            foreignField: '_id',
            as: 'encuesta'
          }
        },
        {
          $unwind: '$encuesta'
        },
        {
          $project: {
            encuestaId: '$_id',
            encuestaTitulo: '$encuesta.titulo',
            cantidad: 1
          }
        },
        {
          $sort: { cantidad: -1 }
        }
      ])
      .exec();

    return {
      totalEncuestas,
      totalRespuestas,
      respuestasPorEncuesta,
    };
  }
}
