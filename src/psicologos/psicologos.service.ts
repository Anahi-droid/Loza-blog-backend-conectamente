import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class PsicologosService {
  constructor(
    @InjectRepository(Psicologo)
    private psicologoRepository: Repository<Psicologo>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async crearPerfil(usuarioId: string, datosProf: Partial<Psicologo>): Promise<Psicologo> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId, rol: 'PSICOLOGO' } });
    
    if (!usuario) {
      throw new NotFoundException('El usuario no existe o no tiene el rol de PSICOLOGO.');
    }

    const nuevoPsicologo = this.psicologoRepository.create({
      ...datosProf,
      usuario,
    });

    return await this.psicologoRepository.save(nuevoPsicologo);
  }

  async listarTodos(): Promise<Psicologo[]> {
    // Trae los perfiles médicos cuyo usuario asociado permanezca ACTIVO en el sistema
    return await this.psicologoRepository.find({
      relations: { usuario: true },
      where: { usuario: { activo: true } }
    });
  }

  async actualizar(usuarioId: string, camposActualizar: Partial<Psicologo>): Promise<Psicologo> {
    const psicologo = await this.psicologoRepository.findOne({ 
      where: { usuario: { id: usuarioId } } 
    });

    if (!psicologo) {
      throw new NotFoundException(`Perfil de psicólogo para el usuario con ID ${usuarioId} no encontrado.`);
    }

    Object.assign(psicologo, camposActualizar);
    return await this.psicologoRepository.save(psicologo);
  }

  // 🚀 OPTION A: Borrado lógico seguro integrado directamente en el repositorio global
  async eliminar(usuarioId: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado en el sistema.`);
    }
    
    // Cambiamos el estado de la cuenta a inactivo en lugar de extirpar el registro físico
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
  }


  // 🎯 NUEVO MÉTODO: Maneja la creación en cascada de Usuario y Perfil Médico
  async crearPerfilUnificado(payload: any): Promise<Psicologo> {
    const { nombre, apellido, email, password, especialidad, numColegiatura, telefono } = payload;

    // 1. Verificar si el email ya existe
    const existeUsuario = await this.usuarioRepository.findOne({ where: { email } });
    if (existeUsuario) {
      throw new Error(`El correo ${email} ya está registrado en la plataforma.`);
    }

    // 2. Crear la entidad de Usuario base con rol de psicólogo
    const salt = await require('bcrypt').genSalt(10);
    const passwordHash = await require('bcrypt').hash(password, salt);

    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      apellido,
      email,
      password: passwordHash,
      rol: 'PSICOLOGO',
      activo: true
    });
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

    // 3. Crear el perfil profesional enlazado al usuario
    const nuevoPerfil = this.psicologoRepository.create({
      especialidad,
      numColegiatura,
      biografia: '',
      usuario: usuarioGuardado
    });

    return await this.psicologoRepository.save(nuevoPerfil);
  }
}