import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progreso } from './progreso.entity';
import { CreateProgresoDto } from './dto/create-progreso.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';

@Injectable()
export class ProgresoService {
  constructor(
    @InjectRepository(Progreso)
    private readonly progresoRepository: Repository<Progreso>,
  ) {}

  async create(createProgresoDto: CreateProgresoDto): Promise<Progreso> {
    const nuevoProgreso = this.progresoRepository.create({
      ...createProgresoDto,
      historial: { id: createProgresoDto.historialId },
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
      where: { id },
      relations: { historial: true },
    });
    if (!progreso) throw new NotFoundException(`Progreso con ID ${id} no encontrado`);
    return progreso;
  }

  async findByPaciente(pacienteId: string): Promise<Progreso[]> {
    return await this.progresoRepository.find({
      where: { historial: { id: pacienteId } }, 
      relations: { historial: true },
      order: { fecha: 'ASC' },
    });
  }

  async update(id: string, updateProgresoDto: UpdateProgresoDto): Promise<Progreso> {
    const progreso = await this.findOne(id);
    const progresoEditado = this.progresoRepository.merge(progreso, {
      ...updateProgresoDto,
      ...(updateProgresoDto.historialId && { historial: { id: updateProgresoDto.historialId } })
    });

    return await this.progresoRepository.save(progresoEditado);
  }

  async remove(id: string): Promise<{ message: string }> {
    const progreso = await this.findOne(id);
    await this.progresoRepository.remove(progreso);
    return { message: `Progreso con ID ${id} eliminado exitosamente` };
  }
}