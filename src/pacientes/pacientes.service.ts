import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Paciente } from './paciente.entity';
import { Usuario } from '../usuarios/usuario.entity';
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
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // 🚀 CREACIÓN UNIFICADA EN UN SOLO PASO (CORREGIDA CON RELACIÓN DE PSICÓLOGO)
  async create(payload: any): Promise<Paciente> {
    const { nombre, apellido, email, fechaNacimiento, creadorId, creadorRol, ...datosPaciente } = payload;

    // 1. Verificar si el correo ya está registrado en la base de datos
    const existeUsuario = await this.usuarioRepository.findOne({ where: { email } });
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario registrado con el correo ${email}`);
    }

    // 2. Crear la cuenta de Usuario base con rol PACIENTE
    const passwordHash = await this.hashPassword('Paciente123*'); // Contraseña temporal
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      rol: 'PACIENTE',
    });
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario) as Usuario;

    // 3. Crear el expediente clínico del Paciente asignando su psicólogo si es el creador
    const nuevoPaciente = this.pacienteRepository.create({
      ...datosPaciente,
      fechaNacimiento: new Date(fechaNacimiento),
      usuario: usuarioGuardado,
      // Si el que lo registra es un PSICOLOGO, asociamos su perfil médico como dueño directo
      psicologo: creadorRol === 'PSICOLOGO' ? { id: creadorId } : null
    });
    
    const pacienteGuardado = await this.pacienteRepository.save(nuevoPaciente) as Paciente;

    // 4. Retornar el paciente completo con la relación de usuario cargada
    const pacienteCompleto = await this.pacienteRepository.findOne({
      where: { id: pacienteGuardado.id },
      relations: { usuario: true, psicologo: true }
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
        psicologo: true
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

  async findByUsuarioId(usuarioId: string): Promise<Paciente> {
  const paciente = await this.pacienteRepository.findOne({
    where: { usuario: { id: usuarioId, activo: true } },
    relations: {
      usuario: true,
      citas: true,
      historiales: true,
      recomendaciones: true,
      psicologo: true,
    },
  });

  if (!paciente) {
    throw new NotFoundException('No se encontró un expediente de paciente para este usuario');
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

  // 🎯 CORREGIDO: Filtra de manera estricta y hermética según el Rol
  async findAll(usuarioLogueado: { id: string; rol: string }): Promise<Paciente[]> {
    // 👑 REGLA ADMIN: Si es administrador, ve absolutamente todos los expedientes activos
    if (usuarioLogueado.rol === 'ADMIN') {
      return await this.pacienteRepository.find({
        where: { usuario: { activo: true } },
        relations: { usuario: true, psicologo: true },
        order: { creadoEn: 'DESC' }
      });
    }


    // 🩺 REGLA PSICÓLOGO BLINDADA: Solo puede ver los pacientes vinculados a su ID médico
    // Buscamos usando el QueryBuilder o relaciones de TypeORM cruzando por usuario.id del psicólogo
    return await this.pacienteRepository.find({
      where: { 
        usuario: { activo: true },
        psicologo: { usuario: { id: usuarioLogueado.id } } // Filtro relacional estricto
      },
      relations: { usuario: true },
      order: { creadoEn: 'DESC' }
    });
  }

  // 🚀 SE MANTIENE EL MÉTODO GLOBAL EXCLUSIVO PARA LOS MODALES DE CITAS GENERALES
  async obtenerTodosActivos(): Promise<Paciente[]> {
    return await this.pacienteRepository.find({
      where: { usuario: { activo: true } },
      relations: { usuario: true },
      order: { creadoEn: 'DESC' }
    });
  }
}