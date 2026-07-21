import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestResultado } from './schemas/test-resultado.schema';
import { AsignacionTest } from './schemas/asignacion-test.schema';
import { CreateTestResultadoDto } from './dto/create-test-resultado.dto';
import { AsignarTestDto } from './dto/asignar-test.dto';
import { ResponderTestDto } from './dto/responder-test.dto';

@Injectable()
export class TestsPsicometricosService {
  constructor(
    @InjectModel(TestResultado.name) private testResultadoModel: Model<TestResultado>,
    @InjectModel(AsignacionTest.name) private asignacionModel: Model<AsignacionTest>,
  ) {}

  // ─── ASIGNAR / ACTIVAR / REACTIVAR TEST ──────────────────────
  async asignarTest(psicologoId: string, dto: AsignarTestDto): Promise<AsignacionTest> {
    const existente = await this.asignacionModel.findOne({
      pacienteId: dto.pacienteId,
      psicologoId,
      tipoTest: dto.tipoTest,
    }).exec();

    if (existente) {
      // Si ya existe, cambiar estado a ACTIVO (reactivar)
      existente.estado = 'ACTIVO';
      existente.nuevoResultado = false;
      return existente.save();
    }

    const nueva = new this.asignacionModel({
      pacienteId: dto.pacienteId,
      psicologoId,
      tipoTest: dto.tipoTest,
      estado: 'ACTIVO',
      intentos: [],
      numeroIntentos: 0,
      nuevoResultado: false,
    });
    return nueva.save();
  }

  // ─── DESACTIVAR TEST ─────────────────────────────────────────
  async desactivarTest(psicologoId: string, asignacionId: string): Promise<AsignacionTest> {
    const asignacion = await this.asignacionModel.findById(asignacionId).exec();
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    if (asignacion.psicologoId !== psicologoId) throw new ForbiddenException('No tienes permisos');
    
    asignacion.estado = 'INACTIVO';
    return asignacion.save();
  }

  // ─── OBTENER ASIGNACIONES DEL PSICÓLOGO ──────────────────────
  async obtenerAsignacionesPsicologo(psicologoId: string): Promise<AsignacionTest[]> {
    return this.asignacionModel.find({ psicologoId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  // ─── OBTENER ASIGNACIONES DEL PACIENTE ───────────────────────
  async obtenerAsignacionesPaciente(pacienteId: string): Promise<AsignacionTest[]> {
    return this.asignacionModel.find({ pacienteId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  // ─── RESPONDER TEST (crea un intento) ────────────────────────
  async responderTest(pacienteId: string, asignacionId: string, dto: ResponderTestDto): Promise<AsignacionTest> {
    const asignacion = await this.asignacionModel.findById(asignacionId).exec();
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    if (asignacion.pacienteId !== pacienteId) throw new ForbiddenException('No tienes permisos');
    if (asignacion.estado !== 'ACTIVO') throw new ForbiddenException('El test no está activo');
    
    // Límite de 1 intento por test
    if (asignacion.intentos.length >= 1) {
      throw new ForbiddenException('Ya has completado este test. Solo se permite un intento.');
    }

    const nuevoIntento = {
      fecha: new Date(),
      respuestas: dto.respuestas,
      puntajeTotal: dto.puntajeTotal,
      diagnostico: dto.diagnostico,
      desglose: dto.desglose,
      alertaCritica: dto.alertaCritica || false,
    };

    asignacion.intentos.push(nuevoIntento);
    asignacion.numeroIntentos = asignacion.intentos.length;
    asignacion.estado = 'COMPLETADO';
    asignacion.nuevoResultado = true;

    return asignacion.save();
  }

  // ─── MARCAR COMO VISTO ───────────────────────────────────────
  async marcarComoVisto(asignacionId: string, psicologoId: string): Promise<AsignacionTest> {
    const asignacion = await this.asignacionModel.findById(asignacionId).exec();
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    if (asignacion.psicologoId !== psicologoId) throw new ForbiddenException('No tienes permisos');
    
    asignacion.nuevoResultado = false;
    return asignacion.save();
  }

  // ─── MÉTODOS ORIGINALES (se mantienen) ───────────────────────
  async registrarResultado(pacienteId: string, dto: CreateTestResultadoDto): Promise<TestResultado> {
    const nuevoResultado = new this.testResultadoModel({
      pacienteId,
      ...dto,
    });
    return nuevoResultado.save();
  }

  async obtenerHistorialPaciente(pacienteId: string): Promise<TestResultado[]> {
    return this.testResultadoModel.find({ pacienteId }).sort({ fechaRealizacion: -1 }).exec();
  }

  async obtenerPromediosMensualesPorTest(tipoTest: string): Promise<any[]> {
    return this.testResultadoModel.aggregate([
      { $match: { tipoTest } },
      {
        $group: {
          _id: { año: { $year: '$fechaRealizacion' }, mes: { $month: '$fechaRealizacion' } },
          promedioPuntaje: { $avg: '$puntajeTotal' },
          totalEvaluaciones: { $sum: 1 },
        },
      },
      { $sort: { '_id.año': -1, '_id.mes': -1 } },
    ]).exec();
  }

  async findOne(id: string): Promise<TestResultado | null> {
    return this.testResultadoModel.findById(id).exec();
  }

  async update(id: string, dto: Partial<CreateTestResultadoDto>): Promise<TestResultado | null> {
    return this.testResultadoModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.testResultadoModel.findByIdAndDelete(id).exec();
    return { deleted: !!res };
  }
}