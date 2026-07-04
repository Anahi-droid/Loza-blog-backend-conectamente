import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './historial.entity';
import { Diagnostico } from './diagnostico.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepository: Repository<Diagnostico>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto, psicologoId: string): Promise<Historial> {
    const nuevoHistorial = this.historialRepository.create({
      fechaSesion: createHistorialDto.fechaSesion,
      diagnostico: createHistorialDto.diagnostico,
      observaciones: createHistorialDto.observaciones,
      paciente: createHistorialDto.pacienteId ? { id: createHistorialDto.pacienteId } : undefined,
      psicologo: { id: psicologoId }, 
    });
    return await this.historialRepository.save(nuevoHistorial);
  }

  async findAll(): Promise<Historial[]> {
    return await this.historialRepository.find({ 
      relations: { paciente: true, psicologo: true } 
    });
  }

  async findOne(id: string): Promise<Historial> {
    const historial = await this.historialRepository.findOne({
      where: { id }, 
      relations: { paciente: true, psicologo: true },
    });
    if (!historial) throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    return historial;
  }

  async update(id: string, updateHistorialDto: UpdateHistorialDto): Promise<Historial> {
    const historial = await this.findOne(id);
    
    const editado = this.historialRepository.merge(historial, {
      fechaSesion: updateHistorialDto.fechaSesion ?? historial.fechaSesion,
      diagnostico: updateHistorialDto.diagnostico ?? historial.diagnostico,
      observaciones: updateHistorialDto.observaciones ?? historial.observaciones,
      paciente: updateHistorialDto.pacienteId ? { id: updateHistorialDto.pacienteId } : historial.paciente,
    });
    
    return await this.historialRepository.save(editado);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
    return { deleted: true, id };
  }

  async createDiagnostico(historialId: string, codigoCIE10: string, descripcion: string): Promise<Diagnostico> {
    const historial = await this.findOne(historialId);
    const nuevoDiagnostico = this.diagnosticoRepository.create({
      codigoCIE10,
      descripcion,
      historial: historial
    });
    return await this.diagnosticoRepository.save(nuevoDiagnostico);
  }

  async findAllDiagnosticos(): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      relations: { historial: true }
    });
  }

  async findOneDiagnostico(id: string): Promise<Diagnostico> {
    const diagnostico = await this.diagnosticoRepository.findOne({
      where: { id },
      relations: { historial: true }
    });
    if (!diagnostico) throw new NotFoundException(`Diagnóstico clínico con ID ${id} no existe.`);
    return diagnostico;
  }

  async updateDiagnostico(id: string, codigoCIE10?: string, descripcion?: string): Promise<Diagnostico> {
    const diagnostico = await this.findOneDiagnostico(id);
    if (codigoCIE10 !== undefined) diagnostico.codigoCIE10 = codigoCIE10;
    if (descripcion !== undefined) diagnostico.descripcion = descripcion;
    return await this.diagnosticoRepository.save(diagnostico);
  }

  async removeDiagnostico(id: string): Promise<{ deleted: boolean; id: string }> {
    const diagnostico = await this.findOneDiagnostico(id);
    await this.diagnosticoRepository.remove(diagnostico);
    return { deleted: true, id };
  }
}