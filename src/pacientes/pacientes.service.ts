import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Cita } from '../citas/cita.entity'; 
import { Psicologo } from '../psicologos/psicologo.entity'; 
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>, 
    @InjectRepository(Psicologo)
    private readonly psicologoRepository: Repository<Psicologo>, 
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // 🚀 CREACIÓN UNIFICADA LIMPIA CON ASIGNACIÓN DE PROPIEDAD DIRECTA
  async create(createPacienteDto: CreatePacienteDto & { creadorId?: string; creadorRol?: string }): Promise<Paciente> {
    const { nombre, apellido, email, fechaNacimiento, creadorId, creadorRol, ...datosPaciente } = createPacienteDto as any;

    const existeUsuario = await this.usuarioRepository.findOne({ where: { email } });
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario registrado con el correo ${email}`);
    }

    const passwordHash = await this.hashPassword('Paciente123*');
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      rol: 'PACIENTE',
    });
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario) as Usuario;

    // 🩺 Buscar si el creador es un psicólogo para asignarlo directamente como dueño de la ficha
    let psicologoAsignado: Psicologo | null = null;
    if (creadorRol === 'PSICOLOGO' && creadorId) {
      psicologoAsignado = await this.psicologoRepository.findOne({
        where: { usuario: { id: creadorId } }
      });
    }

    const nuevoPaciente = this.pacienteRepository.create({
      ...datosPaciente,
      fechaNacimiento: new Date(fechaNacimiento),
      usuario: usuarioGuardado,
      psicologo: psicologoAsignado, // 🎯 Enlazado nativamente aquí sin citas intermedias fakes
    });
    
    const pacienteGuardado = await this.pacienteRepository.save(nuevoPaciente) as Paciente;

    const pacienteCompleto = await this.pacienteRepository.findOne({
      where: { id: pacienteGuardado.id },
      relations: { usuario: true }
    });

    return pacienteCompleto || pacienteGuardado;
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

    if (paciente.usuario) {
      delete paciente.usuario.password;
    }

    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto & { nombre?: string; apellido?: string }): Promise<Paciente> {
    const { nombre, apellido, ...datosAActualizar } = updatePacienteDto as any;
    
    const paciente = await this.findOne(id);

    if (paciente.usuario && (nombre || apellido)) {
      if (nombre) paciente.usuario.nombre = nombre.trim();
      if (apellido) paciente.usuario.apellido = apellido.trim();
      await this.usuarioRepository.save(paciente.usuario);
    }

    this.pacienteRepository.merge(paciente, datosAActualizar);
    return await this.pacienteRepository.save(paciente);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const paciente = await this.findOne(id);
    
    if (paciente.usuario) {
      paciente.usuario.activo = false;
      await this.usuarioRepository.save(paciente.usuario);
    }

    await this.pacienteRepository.remove(paciente);
    return { deleted: true };
  }

  // 🩺 FILTRO DE PRIVACIDAD INTEGRAL: Muestra los pacientes creados por él O que tengan cita con él
  async findAll(usuarioLogueado: { id: string; rol: string }): Promise<Paciente[]> {
    if (usuarioLogueado.rol === 'ADMIN') {
      return await this.pacienteRepository.find({
        where: { usuario: { activo: true } },
        relations: { usuario: true },
        order: { creadoEn: 'DESC' }
      });
    }

    // El psicólogo ve pacientes de los cuales es dueño directo O con quienes tiene una cita agendada
    return await this.pacienteRepository.createQueryBuilder('paciente')
      .innerJoinAndSelect('paciente.usuario', 'usuario', 'usuario.activo = :activo', { activo: true })
      .leftJoin('paciente.psicologo', 'psicologoDirecto')
      .leftJoin('psicologoDirecto.usuario', 'psicologoDirectoUsuario')
      .leftJoin('usuario.citas', 'cita') 
      .leftJoin('cita.psicologo', 'psicologoCita')
      .leftJoin('psicologoCita.usuario', 'psicologoCitaUsuario')
      .where('psicologoDirectoUsuario.id = :id OR psicologoCitaUsuario.id = :id', { id: usuarioLogueado.id })
      .orderBy('paciente.creadoEn', 'DESC')
      .getMany();
  }

  // 🚀 PARA EL BUSCADOR GLOBAL DEL MODAL: Envía todos los pacientes activos
  async obtenerTodosActivos(): Promise<Paciente[]> {
    return await this.pacienteRepository.find({
      where: { usuario: { activo: true } },
      relations: { usuario: true },
      order: { creadoEn: 'DESC' }
    });
  }
}