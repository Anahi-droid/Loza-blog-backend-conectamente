import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<Paciente> {
    const { usuarioId, ...datosPaciente } = createPacienteDto;

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId, activo: true },
      relations: { perfilPaciente: true }
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${usuarioId} no existe.`);
    }

    if (usuario.rol !== 'PACIENTE') {
      throw new BadRequestException(`El usuario debe tener el rol 'PACIENTE' para crearle un expediente clínico.`);
    }

    if (usuario.perfilPaciente) {
      throw new ConflictException(`El usuario ya tiene un expediente clínico de paciente asignado.`);
    }

    const nuevoPaciente = this.pacienteRepository.create({
      ...datosPaciente,
      usuario: usuario, 
    });

    return await this.pacienteRepository.save(nuevoPaciente);
  }

  
  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      where: {
        rol: 'PACIENTE',
        activo: true
      },
      relations: {
        perfilPaciente: true 
      }
    });
  }

  
  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, usuario: { activo: true } },
      relations: {
        usuario: true,
        citas: true,
        historiales: true,
        recomendaciones: true,
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Expediente de Paciente con ID ${id} no fue encontrado`);
    }

    // Opcional: Eliminar la contraseña de la respuesta por seguridad
    if (paciente.usuario) {
      delete paciente.usuario.password;
    }

    return paciente;
  }

  
  async update(id: string, updatePacienteDto: UpdatePacienteDto): Promise<Paciente> {
    const { usuarioId, ...datosAActualizar } = updatePacienteDto;
    
    const paciente = await this.findOne(id);

  
    if (usuarioId && paciente.usuario?.id !== usuarioId) {
      throw new BadRequestException('No se permite reasignar el expediente a otro usuario.');
    }

    this.pacienteRepository.merge(paciente, datosAActualizar);
    return await this.pacienteRepository.save(paciente);
  }

  
  async remove(id: string): Promise<{ deleted: boolean }> {
    const paciente = await this.findOne(id);
    await this.pacienteRepository.remove(paciente);
    return { deleted: true };
  }
}