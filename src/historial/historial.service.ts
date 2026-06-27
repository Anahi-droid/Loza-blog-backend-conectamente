import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './historial.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    const nuevoHistorial = this.historialRepository.create({
      ...createHistorialDto,
      paciente: { id: createHistorialDto.pacienteId ? String(createHistorialDto.pacienteId) : undefined } as any,
      psicologo: { id: createHistorialDto.psicologoId ? String(createHistorialDto.psicologoId) : undefined } as any,
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
      where: { id: Number(id) as any },
      relations: { paciente: true, psicologo: true },
    });
    if (!historial) throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    return historial;
  }

  async update(id: string, updateHistorialDto: UpdateHistorialDto): Promise<Historial> {
    const historial = await this.findOne(id);
    const editado = this.historialRepository.merge(historial, {
      ...updateHistorialDto,
      paciente: updateHistorialDto.pacienteId ? ({ id: String(updateHistorialDto.pacienteId) } as any) : historial.paciente,
      psicologo: updateHistorialDto.psicologoId ? ({ id: String(updateHistorialDto.psicologoId) } as any) : historial.psicologo,
    });
    return await this.historialRepository.save(editado);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
    return { deleted: true };
  }
}