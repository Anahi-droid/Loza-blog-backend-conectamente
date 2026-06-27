import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './especialidade.entity';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto';

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
}