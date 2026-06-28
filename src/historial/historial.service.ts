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

  // NO MODIFICADO - Se mantiene idéntico como me pediste
  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    const nuevoHistorial = this.historialRepository.create({
      ...createHistorialDto,
      paciente: { id: createHistorialDto.pacienteId ? String(createHistorialDto.pacienteId) : undefined } as any,
      psicologo: { id: createHistorialDto.psicologoId ? String(createHistorialDto.psicologoId) : undefined } as any,
    });
    return await this.historialRepository.save(nuevoHistorial);
  }

  // NO MODIFICADO - Se mantiene idéntico como me pediste
  async findAll(): Promise<Historial[]> {
    return await this.historialRepository.find({ 
      relations: { paciente: true, psicologo: true } 
    });
  }

  // CORREGIDO: Eliminamos el Number(id) para que acepte el UUID en string plano
  async findOne(id: string): Promise<Historial> {
    const historial = await this.historialRepository.findOne({
      where: { id: id as any }, // Ahora busca directamente el UUID como string
      relations: { paciente: true, psicologo: true },
    });
    if (!historial) throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    return historial;
  }

  // CORREGIDO: Agregado el casteo final "as Historial" para eliminar la línea roja en el return
  async update(id: string, updateHistorialDto: UpdateHistorialDto): Promise<Historial> {
    const historial = await this.findOne(id); // Llama al findOne corregido de arriba
    
    const editado = this.historialRepository.merge(historial, {
      ...updateHistorialDto,
      paciente: updateHistorialDto.pacienteId ? ({ id: String(updateHistorialDto.pacienteId) } as any) : historial.paciente,
      psicologo: updateHistorialDto.psicologoId ? ({ id: String(updateHistorialDto.psicologoId) } as any) : historial.psicologo,
    });
    
    return await this.historialRepository.save(editado) as Historial;
  }

  // CORREGIDO: Reutiliza el findOne corregido con UUID
  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    const historial = await this.findOne(id);
    await this.historialRepository.remove(historial);
    return { deleted: true, id };
  }
}