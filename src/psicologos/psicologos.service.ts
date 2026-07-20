import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Psicologo } from '../psicologos/psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Especialidad } from '../especialidades/especialidade.entity';
import { CreatePsicologoDto } from './dto/create-psicologo.dto';

@Injectable()
export class PsicologosService {
  constructor(
    @InjectRepository(Psicologo)
    private psicologoRepository: Repository<Psicologo>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Especialidad)
    private especialidadRepository: Repository<Especialidad>,
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
      relations: { usuario: true, especialidades: true },
      where: { usuario: { activo: true } }
    });
  }

  async actualizar(usuarioId: string, camposActualizar: any): Promise<Psicologo> {
    const psicologo = await this.psicologoRepository.findOne({ 
      where: { usuario: { id: usuarioId } },
      relations: { especialidades: true }
    });

    if (!psicologo) {
      throw new NotFoundException(`Perfil de psicólogo para el usuario con ID ${usuarioId} no encontrado.`);
    }

    const { especialidadesIds, registroProfesional, ...restoCampos } = camposActualizar;

    // Si vienen IDs de especialidades desde el front, actualizamos la tabla intermedia ManyToMany
    if (especialidadesIds && Array.isArray(especialidadesIds)) {
      const especialidadesEncontradas = await this.especialidadRepository.find({
        where: { id: In(especialidadesIds) }
      });
      psicologo.especialidades = especialidadesEncontradas;
    }

    // Mapeamos los campos planos correspondientes del payload
    if (registroProfesional) {
      psicologo.numColegiatura = registroProfesional;
    }

    Object.assign(psicologo, restoCampos);
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

  // 🎯 NUEVO MÉTODO: Maneja la creación en cascada de Usuario, Perfil Médico y especialidades ManyToMany
  async crearPerfilUnificado(payload: CreatePsicologoDto): Promise<Psicologo> {
    const { nombre, apellido, email, password, especialidadesIds, licenciaProfesional, telefono } = payload;

    // 1. Verificar si el email ya existe
    const existeUsuario = await this.usuarioRepository.findOne({ where: { email } });
    if (existeUsuario) {
      throw new Error(`El correo ${email} ya está registrado en la plataforma.`);
    }

    // 2. Buscar las entidades de especialidad que correspondan a los IDs recibidos
    let especialidadesEncontradas: Especialidad[] = [];
    if (especialidadesIds && especialidadesIds.length > 0) {
      especialidadesEncontradas = await this.especialidadRepository.find({
        where: { id: In(especialidadesIds) }
      });
    }

    // 3. Crear la entidad de Usuario base con rol de psicólogo
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

    // 4. Crear el perfil profesional enlazado al usuario y a sus especialidades maestras
    const nuevoPerfil = this.psicologoRepository.create({
      numColegiatura: licenciaProfesional,
      biografia: telefono || '',
      usuario: usuarioGuardado,
      especialidades: especialidadesEncontradas 
    });

    return await this.psicologoRepository.save(nuevoPerfil);
  }
}