import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestResultado } from './schemas/test-resultado.schema';
import { CreateTestResultadoDto } from './dto/create-test-resultado.dto';

@Injectable()
export class TestsPsicometricosService {
  constructor(
    @InjectModel(TestResultado.name) private testResultadoModel: Model<TestResultado>,
  ) {}

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
      {
        $match: { tipoTest: tipoTest } 
      },
      {
        $group: {
          _id: {
            año: { $year: '$fechaRealizacion' },
            mes: { $month: '$fechaRealizacion' }
          },
          promedioPuntaje: { $avg: '$puntajeTotal' },
          totalEvaluaciones: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.año': -1, '_id.mes': -1 } 
      }
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
