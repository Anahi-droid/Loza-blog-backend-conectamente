import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  // POST - Corregido a Promise<Paciente>
  async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
    const { usuarioId, ...datosPaciente } = createPacienteDto;

    const nuevoPaciente = this.pacienteRepository.create({
      ...datosPaciente,
      usuario: { id: usuarioId } as any, 
    });

    return await this.pacienteRepository.save(nuevoPaciente);
  }

  // GET (Todos) - Relaciones en formato de objeto estructurado
  async findAll(): Promise<Paciente[]> {
    return await this.pacienteRepository.find({
      relations: {
        usuario: true,
      },
    });
  }

  // GET (Por ID) - Relaciones en formato de objeto estructurado
  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        citas: true,
        historiales: true,
        recomendaciones: true,
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no fue encontrado`);
    }

    return paciente;
  }

  // PATCH
  async update(id: string, updatePacienteDto: UpdatePacienteDto): Promise<Paciente> {
    const { usuarioId, ...datosAActualizar } = updatePacienteDto;
    
    const paciente = await this.findOne(id);

    if (usuarioId) {
      paciente.usuario = { id: usuarioId } as any;
    }

    this.pacienteRepository.merge(paciente, datosAActualizar);
    return await this.pacienteRepository.save(paciente);
  }

  // DELETE
  async remove(id: string): Promise<{ deleted: boolean }> {
    const paciente = await this.findOne(id);
    await this.pacienteRepository.remove(paciente);
    return { deleted: true };
  }
}