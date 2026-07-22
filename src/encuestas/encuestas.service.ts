import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
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
      psicologoId, // Asignar el psicólogo creador
    });
    return await nuevaEncuesta.save();
  }

  // 🎯 Cada psicólogo ve únicamente sus plantillas de encuestas (Admin ve todas)
  async findAllPorRol(usuarioId: string, rol: string): Promise<Encuesta[]> {
    if (rol === 'ADMIN') {
      return await this.encuestaModel.find().exec();
    }
    return await this.encuestaModel.find({ psicologoId: usuarioId }).exec();
  }

  async findOne(id: string): Promise<Encuesta> {
    const encuesta = await this.encuestaModel.findById(id).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${id} no encontrada`);
    }
    return encuesta;
  }

  async update(id: string, updateEncuestaDto: UpdateEncuestaDto, psicologoId: string, rol: string): Promise<Encuesta> {
    const encuesta = await this.findOne(id);
    if (rol !== 'ADMIN' && encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('No tienes permisos para modificar esta encuesta');
    }

    const encuestaExistente = await this.encuestaModel
      .findByIdAndUpdate(id, updateEncuestaDto, { new: true })
      .exec();
    
    return encuestaExistente!;
  }

  async remove(id: string, psicologoId: string, rol: string): Promise<any> {
    const encuesta = await this.findOne(id);
    if (rol !== 'ADMIN' && encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta encuesta');
    }

    await this.encuestaModel.findByIdAndDelete(id).exec();
    // Limpiar asignaciones vinculadas
    await this.asignacionModel.deleteMany({ encuestaId: id }).exec();

    return { eliminado: true, id };
  }

  async guardarRespuesta(encuestaId: string, usuarioId: string, respuestas: any): Promise<Respuesta> {
    const nuevaRespuesta = new this.respuestaModel({
      encuestaId,
      usuarioId,
      respuestas,
    });
    const respuestaGuardada = await nuevaRespuesta.save();

    // Marcar la asignación como RESPONDIDA de forma automática
    await this.marcarEncuestaRespondida(encuestaId, usuarioId);

    return respuestaGuardada;
  }

  async obtenerRespuestasPorEncuesta(encuestaId: string, psicologoId: string, rol: string): Promise<Respuesta[]> {
    const encuesta = await this.encuestaModel.findById(encuestaId).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${encuestaId} no encontrada`);
    }

    if (rol !== 'ADMIN' && encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('Solo puedes ver las respuestas de encuestas que creaste');
    }

    return await this.respuestaModel.find({ encuestaId }).exec();
  }

  async obtenerMetricasGeneralesPorRol(psicologoId: string, rol: string): Promise<any> {
    const filtro = rol === 'ADMIN' ? {} : { psicologoId };

    const totalEncuestas = await this.encuestaModel.countDocuments(filtro).exec();
    
    // Obtener los IDs de las encuestas del psicólogo
    const encuestasPropias = await this.encuestaModel.find(filtro, { _id: 1 }).exec();
    const encuestaIds = encuestasPropias.map(e => e._id.toString());

    const totalRespuestas = await this.respuestaModel.countDocuments({
      encuestaId: { $in: encuestaIds }
    }).exec();

    return {
      totalEncuestas,
      totalRespuestas,
      respuestasPorEncuesta: [],
    };
  }

  async obtenerMisRespuestas(usuarioId: string): Promise<Respuesta[]> {
    return await this.respuestaModel.find({ usuarioId }).exec();
  }

  async asignarEncuesta(encuestaId: string, psicologoId: string, pacienteId: string): Promise<AsignacionEncuesta> {
    const encuesta = await this.encuestaModel.findById(encuestaId).exec();
    if (!encuesta) {
      throw new NotFoundException(`Encuesta con ID ${encuestaId} no encontrada`);
    }

    if (encuesta.psicologoId !== psicologoId) {
      throw new ForbiddenException('Solo puedes asignar encuestas que creaste');
    }

    const asignacionExistente = await this.asignacionModel.findOne({
      encuestaId,
      pacienteId,
    }).exec();

    if (asignacionExistente) {
      throw new ForbiddenException('Esta encuesta ya fue asignada a este paciente');
    }

    const nuevaAsignacion = new this.asignacionModel({
      encuestaId,
      psicologoId,
      pacienteId,
      estado: 'PENDIENTE',
    });

    return await nuevaAsignacion.save();
  }

  async obtenerEncuestasAsignadas(psicologoId: string): Promise<any[]> {
    return await this.asignacionModel.find({ psicologoId }).exec();
  }

  // 🎯 Retorna los objetos de encuestas asignadas directamente para la vista del paciente
  async obtenerMisEncuestasAsignadas(pacienteUsuarioId: string): Promise<any[]> {
    if (!pacienteUsuarioId) return [];

    const pacienteObjId = Types.ObjectId.isValid(pacienteUsuarioId)
      ? new Types.ObjectId(pacienteUsuarioId)
      : pacienteUsuarioId;

    // 🎯 Consulta flexible: Busca la asignación sea que se haya guardado como string u ObjectId,
    // o si fue guardado por id de Usuario o de Paciente.
    const asignaciones = await this.asignacionModel.find({
      $or: [
        { pacienteId: pacienteUsuarioId },
        { pacienteId: pacienteObjId },
      ],
    }).exec();

    if (!asignaciones || asignaciones.length === 0) {
      return [];
    }

    // Extraer los IDs de las encuestas y convertirlos en Types.ObjectId
    const encuestaObjectIds = asignaciones
      .map((a) => a.encuestaId)
      .filter((id): id is Types.ObjectId => Boolean(id))
      .map((id) => (typeof id === 'string' && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id));

    if (encuestaObjectIds.length === 0) return [];

    // Retornar las plantillas de encuestas que le corresponden
    return await this.encuestaModel.find({
      _id: { $in: encuestaObjectIds },
    }).exec();
  }

  async marcarEncuestaRespondida(encuestaId: string, pacienteId: string): Promise<void> {
    await this.asignacionModel.findOneAndUpdate(
      { encuestaId, pacienteId },
      { estado: 'RESPONDIDA', fechaRespuesta: new Date() }
    ).exec();
  }
}