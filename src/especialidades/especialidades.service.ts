import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './especialidade.entity';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto';
import { UpdateEspecialidadeDto } from './dto/update-especialidade.dto';

@Injectable()
export class EspecialidadesService {
  constructor(
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
  ) {}

  async create(createEspecialidadDto: CreateEspecialidadDto): Promise<Especialidad> {
    const existe = await this.especialidadRepository.findOne({ where: { nombre: createEspecialidadDto.nombre } });
    if (existe) throw new ConflictException('La especialidad ya se encuentra registrada');

    const nueva = this.especialidadRepository.create(createEspecialidadDto);
    return await this.especialidadRepository.save(nueva);
  }

  async findAll(): Promise<Especialidad[]> {
    return await this.especialidadRepository.find({ relations: { psicologos: true } });
  }

  async findOne(id: string): Promise<Especialidad> {
    const especialidad = await this.especialidadRepository.findOne({ where: { id }, relations: { psicologos: true } });
    if (!especialidad) throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    return especialidad;
  }

  async update(id: string, updateEspecialidadeDto: UpdateEspecialidadeDto): Promise<Especialidad> {
    const especialidad = await this.findOne(id);

    if (updateEspecialidadeDto.nombre) {
      const existeNombre = await this.especialidadRepository.findOne({ 
        where: { nombre: updateEspecialidadeDto.nombre as string } 
      });
      
      if (existeNombre && existeNombre.id !== id) {
        throw new ConflictException('Ya existe otra especialidad con ese nombre');
      }
    }

    const especialidadEditada = this.especialidadRepository.merge(especialidad, updateEspecialidadeDto);
    return await this.especialidadRepository.save(especialidadEditada);
  }

  async remove(id: string): Promise<{ message: string }> {
    const especialidad = await this.findOne(id);
    await this.especialidadRepository.remove(especialidad);
    return { message: `Especialidad con ID ${id} eliminada exitosamente` };
  }
}