import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progreso } from './progreso.entity';
import { CreateProgresoDto } from './dto/create-progreso.dto';

@Injectable()
export class ProgresoService {
  constructor(
    @InjectRepository(Progreso)
    private readonly progresoRepository: Repository<Progreso>,
  ) {}

  async create(createProgresoDto: CreateProgresoDto): Promise<Progreso> {
    const nuevoProgreso = this.progresoRepository.create({
      ...createProgresoDto,
      historial: { id: Number(createProgresoDto.historialId) as any },
    });
    return await this.progresoRepository.save(nuevoProgreso);
  }

  async findAll(): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      relations: { historial: true },
    });
  }

  async findOne(id: string): Promise<Progreso> {
    const progreso = await this.progresoRepository.findOne({
      where: { id: Number(id) as any },
      relations: { historial: true },
    });
    if (!progreso) throw new NotFoundException(`Progreso con ID ${id} no encontrado`);
    return progreso;
  }

  async findByPaciente(pacienteId: string): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      where: { historial: { pacienteId: Number(pacienteId) as any } },
      relations: { historial: true },
      order: { fecha: 'ASC' },
    });
  }
}