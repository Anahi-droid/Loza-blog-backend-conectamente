import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recomendacion } from './recomendacion.entity';
import { Progreso } from '../progreso/progreso.entity'; 
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacione.dto';

@Injectable()
export class RecomendacionesService {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
    @InjectRepository(Progreso)
    private readonly progresoRepository: Repository<Progreso>,
  ) {}


  async create(createRecomendacionDto: CreateRecomendacionDto, psicologoId: string): Promise<Recomendacion> {
    const nuevaRecomendacion = this.recomendacionRepository.create({
      fecha: createRecomendacionDto.fecha,
      titulo: createRecomendacionDto.titulo,
      descripcion: createRecomendacionDto.descripcion,
      paciente: createRecomendacionDto.pacienteId ? { id: String(createRecomendacionDto.pacienteId) } : undefined,
      psicologo: { id: psicologoId }, 
    });
    return await this.recomendacionRepository.save(nuevaRecomendacion);
  }

  async findAll(): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      relations: { paciente: true, psicologo: true },
    });
  }

  async findOne(id: string): Promise<Recomendacion> {
    const recomendacion = await this.recomendacionRepository.findOne({
      where: { id },
      relations: { paciente: true, psicologo: true },
    });
    if (!recomendacion) throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    return recomendacion;
  }

  async findByPaciente(pacienteId: string): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      where: { paciente: { id: pacienteId } },
      relations: { psicologo: true, paciente: true }, 
    });
  }

  async update(id: string, updateRecomendacionDto: UpdateRecomendacionDto): Promise<Recomendacion> {
    const recomendacion = await this.findOne(id);
    
    const recomendacionPreld = this.recomendacionRepository.create({
      ...recomendacion,
      ...updateRecomendacionDto,
      paciente: updateRecomendacionDto.pacienteId ? { id: String(updateRecomendacionDto.pacienteId) } : recomendacion.paciente,
    });

    return await this.recomendacionRepository.save(recomendacionPreld);
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    const recomendacion = await this.findOne(id);
    await this.recomendacionRepository.remove(recomendacion);
    return { deleted: true, id };
  }


  async createProgreso(historialId: string, fecha: Date, estadoEmocional: string, avance: string, observaciones: string): Promise<Progreso> {
    const nuevoProgreso = this.progresoRepository.create({
      fecha,
      estadoEmocional,
      avance,
      observaciones,
      historial: { id: historialId }
    });
    return await this.progresoRepository.save(nuevoProgreso);
  }

  async findAllProgresos(): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      relations: { historial: true }
    });
  }

  async findOneProgreso(id: string): Promise<Progreso> {
    const progreso = await this.progresoRepository.findOne({
      where: { id },
      relations: { historial: true }
    });
    if (!progreso) throw new NotFoundException(`Registro de progreso con ID ${id} no encontrado.`);
    return progreso;
  }

  async updateProgreso(id: string, estadoEmocional?: string, avance?: string, observaciones?: string): Promise<Progreso> {
    const progreso = await this.findOneProgreso(id);
    if (estadoEmocional !== undefined) progreso.estadoEmocional = estadoEmocional;
    if (avance !== undefined) progreso.avance = avance;
    if (observaciones !== undefined) progreso.observaciones = observaciones;
    return await this.progresoRepository.save(progreso);
  }

  async removeProgreso(id: string): Promise<{ deleted: boolean; id: string }> {
    const progreso = await this.findOneProgreso(id);
    await this.progresoRepository.remove(progreso);
    return { deleted: true, id };
  }
}