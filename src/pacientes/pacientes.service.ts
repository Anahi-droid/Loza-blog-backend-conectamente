import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(payload: any): Promise<Paciente> {
    const { nombre, apellido, email, fechaNacimiento, creadorId, creadorRol, ...datosPaciente } = payload;

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

    const nuevoPaciente = this.pacienteRepository.create({
      ...datosPaciente,
      fechaNacimiento: new Date(fechaNacimiento),
      usuario: usuarioGuardado,
      psicologo: creadorRol === 'PSICOLOGO' ? { id: creadorId } : null
    });
    
    const pacienteGuardado = await this.pacienteRepository.save(nuevoPaciente) as Paciente;

    const pacienteCompleto = await this.pacienteRepository.findOne({
      where: { id: pacienteGuardado.id },
      relations: { 
        usuario: true, 
        psicologo: { usuario: true } 
      }
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
        psicologo: { usuario: true }
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

  // 🎯 Carga limpia con la sub-relación 'psicologo.usuario' para que traiga Nombres y Apellidos
  async findAll(usuarioLogueado: { id: string; rol: string }): Promise<Paciente[]> {
    if (usuarioLogueado.rol === 'ADMIN') {
      return await this.pacienteRepository.find({
        where: { usuario: { activo: true } },
        relations: { 
          usuario: true, 
          psicologo: { usuario: true } 
        },
        order: { creadoEn: 'DESC' }
      });
    }

    return await this.pacienteRepository.find({
      where: { 
        usuario: { activo: true },
        psicologo: { usuario: { id: usuarioLogueado.id } }
      },
      relations: { 
        usuario: true, 
        psicologo: { usuario: true } 
      },
      order: { creadoEn: 'DESC' }
    });
  }

  async obtenerTodosActivos(): Promise<Paciente[]> {
    return await this.pacienteRepository.find({
      where: { usuario: { activo: true } },
      relations: { usuario: true, psicologo: { usuario: true } },
      order: { creadoEn: 'DESC' }
    });
  }

  // 🎯 Busca el expediente del paciente a través de su usuario_id (del token JWT)
  async obtenerPerfilPorUsuarioId(usuarioId: string): Promise<Paciente> {
    const paciente = await this.pacienteRepository.findOne({
      where: { usuario: { id: usuarioId, activo: true } },
      relations: {
        usuario: true,
        psicologo: { usuario: true },
        citas: true,
      },
    });

    if (!paciente) {
      throw new NotFoundException('Aún no tienes un expediente clínico creado.');
    }

    if (paciente.usuario) {
      delete paciente.usuario.password;
    }

    return paciente;
  }
}