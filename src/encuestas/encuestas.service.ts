import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Encuesta, EncuestaDocument } from './schemas/encuesta.schema';
import { Respuesta, RespuestaDocument } from './schemas/respuesta.schema';
import { AsignacionEncuesta, AsignacionEncuestaDocument } from './schemas/asignacion-encuesta.schema';
import { UpdateEncuestaDto } from './dto/update-encuesta.dto';

@Injectable()
export class EncuestasService {
  constructor(
    @InjectModel(Encuesta.name) private readonly encuestaModel: Model<EncuestaDocument>,
    @InjectModel(Respuesta.name) private readonly respuestaModel: Model<RespuestaDocument>,
    @InjectModel(AsignacionEncuesta.name) private readonly asignacionModel: Model<AsignacionEncuestaDocument>,
  ) {}

  async create(createEncuestaDto: any, psicologoId: string): Promise<Encuesta> {
    const nuevaEncuesta = new this.encuestaModel({
      ...createEncuestaDto,
      psicologoId, // Asignar el psicólogo que crea la encuesta
    });
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

  async obtenerRespuestasPorEncuesta(encuestaId: string, psicologoId: string): Promise<Respuesta[]> {
    // Verificar que la encuesta pertenece al psicólogo
    const encuesta = await this.encuestaModel.findById(encuestaId).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${encuestaId} no encontrada`);
    }

    // Solo el psicólogo que creó la encuesta puede ver las respuestas
    if (encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('Solo puedes ver las respuestas de encuestas que creaste');
    }

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

  async obtenerMisRespuestas(usuarioId: string): Promise<Respuesta[]> {
    // Obtener las asignaciones del usuario (paciente)
    const asignaciones = await this.asignacionModel.find({ pacienteId: usuarioId }).exec();
    const encuestaIds = asignaciones
      .map(a => a.encuestaId)
      .filter((id): id is any => id !== undefined);

    // Retornar solo las respuestas de encuestas que le fueron asignadas
    return await this.respuestaModel.find({ 
      usuarioId,
      encuestaId: { $in: encuestaIds }
    }).exec();
  }

  async asignarEncuesta(encuestaId: string, psicologoId: string, pacienteId: string): Promise<AsignacionEncuesta> {
    // Verificar que la encuesta existe y pertenece al psicólogo
    const encuesta = await this.encuestaModel.findById(encuestaId).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${encuestaId} no encontrada`);
    }

    if (encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('Solo puedes asignar encuestas que creaste');
    }

    // Verificar que no exista una asignación previa
    const asignacionExistente = await this.asignacionModel.findOne({
      encuestaId,
      pacienteId,
    }).exec();

    if (asignacionExistente) {
      throw new ForbiddenException('Esta encuesta ya fue asignada a este paciente');
    }

    // Crear la asignación
    const nuevaAsignacion = new this.asignacionModel({
      encuestaId,
      psicologoId,
      pacienteId,
      estado: 'PENDIENTE',
    });

    return await nuevaAsignacion.save();
  }

  async obtenerEncuestasAsignadas(psicologoId: string): Promise<any[]> {
    // Obtener todas las asignaciones del psicólogo con detalles de la encuesta y paciente
    const asignaciones = await this.asignacionModel.find({ psicologoId })
      .populate('encuestaId', 'titulo descripcion preguntas')
      .populate('pacienteId', 'usuario')
      .exec();

    return asignaciones;
  }

  async obtenerMisEncuestasAsignadas(pacienteId: string): Promise<any[]> {
    // Obtener las encuestas asignadas a un paciente
    const asignaciones = await this.asignacionModel.find({ pacienteId })
      .populate('encuestaId', 'titulo descripcion preguntas')
      .populate('psicologoId', 'usuario')
      .exec();

    return asignaciones;
  }

  async marcarEncuestaRespondida(encuestaId: string, pacienteId: string): Promise<void> {
    await this.asignacionModel.findOneAndUpdate(
      { encuestaId, pacienteId },
      { estado: 'RESPONDIDA', fechaRespuesta: new Date() }
    ).exec();
  }
}
