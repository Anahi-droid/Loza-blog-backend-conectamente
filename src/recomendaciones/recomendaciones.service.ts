import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recomendacion } from './recomendacion.entity';
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';

@Injectable()
export class RecomendacionesService {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
  ) {}

  async create(createRecomendacionDto: CreateRecomendacionDto): Promise<Recomendacion> {
    const nuevaRecomendacion = this.recomendacionRepository.create({
      ...createRecomendacionDto,
      paciente: { id: createRecomendacionDto.pacienteId ? String(createRecomendacionDto.pacienteId) : undefined },
      psicologo: { id: createRecomendacionDto.psicologoId ? String(createRecomendacionDto.psicologoId) : undefined },
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
      where: { id: Number(id) as any },
      relations: { paciente: true, psicologo: true },
    });
    if (!recomendacion) throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    return recomendacion;
  }

  async findByPaciente(pacienteId: string): Promise<Recomendacion[]> {
    return await this.recomendacionRepository.find({
      where: { pacienteId: Number(pacienteId) as any },
      relations: { psicologo: true },
    });
  }
}