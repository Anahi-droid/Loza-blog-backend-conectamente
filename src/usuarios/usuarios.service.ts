import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Psicologo)
    private readonly psicologoRepo: Repository<Psicologo>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  async crear(dto: CreateUsuarioDto): Promise<Usuario> {
    const existe = await this.usuarioRepo.findOne({
      where: { email: dto.email },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${dto.email}`,
      );
    }
    if (!dto.password) {
      throw new BadRequestException('La contraseña es requerida');
    }

    const passwordHash = await this.hashPassword(dto.password);
    
    // Extraemos campos dinámicos para el perfil clínico
    const { especialidad, licenciaProfesional, telefono, ...datosUsuario } = dto as any;

    // 🚀 Creamos la entidad sin forzar el tipo a la izquierda, dejamos que infiera o lo casteamos al vuelo
    const usuario = this.usuarioRepo.create(datosUsuario as Partial<Usuario>);
    usuario.password = passwordHash;

    // Guardamos forzando a que TypeScript reconozca el retorno como una única entidad Usuario
    const usuarioGuardado = await this.usuarioRepo.save(usuario) as Usuario;

    // Si el rol es PSICOLOGO, creamos el perfil clínico de forma transaccional y directa
    if (usuarioGuardado.rol === 'PSICOLOGO') {
      const nuevoPsicologo = this.psicologoRepo.create({
        numColegiatura: (licenciaProfesional || `REG-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
        especialidad: (especialidad || 'Terapia General').trim(),
        biografia: (telefono || 'Sin teléfono').trim(),
        usuario: usuarioGuardado // Ahora calza perfectamente el tipo Usuario único
      });
      await this.psicologoRepo.save(nuevoPsicologo);
    }

    // Buscamos y retornamos el usuario completo con la relación mapeada para el frontend
    const usuarioConPerfil = await this.usuarioRepo.findOne({
      where: { id: usuarioGuardado.id },
      relations: { perfilPsicologo: true }
    });

    return usuarioConPerfil || usuarioGuardado;
  }

  async actualizar(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);

    if (dto.password) {
      dto.password = await this.hashPassword(dto.password);
    }

    Object.assign(usuario, dto);
    return this.usuarioRepo.save(usuario);
  }

  async desactivar(id: string): Promise<void> {
    // 🎯 Cambiado para que no falle si se manipula un usuario inactivo
    const usuario = await this.buscarPorIdAdministrativo(id);
    usuario.activo = false;
    await this.usuarioRepo.save(usuario);
  }

  async activar(id: string): Promise<void> {
    // 🎯 Busca al usuario ignorando si está inactivo y le devuelve el acceso
    const usuario = await this.buscarPorIdAdministrativo(id);
    usuario.activo = true;
    await this.usuarioRepo.save(usuario);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ 
      where: { email, activo: true },
      relations: {
        perfilPsicologo: true 
      }
    });
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, activo: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async listarTodos(
    pagina = 1,
    limite = 10,
    rol?: string,
  ): Promise<{ data: Usuario[]; total: number; pagina: number; limite: number }> {
    const query = this.usuarioRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.perfilPsicologo', 'perfilPsicologo');

    if (rol) {
      query.andWhere('u.rol = :rol', { rol });
    }

    // 🎯 CORREGIDO: Eliminamos el filtro estricto de activo=true para que el Admin vea a todos
    // Sencillamente ordenamos por los creados más recientemente
    query.orderBy('u.creadoEn', 'DESC');
    
    const [data, total] = await query
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { data, total, pagina, limite };
  }

  // 🎯 NUEVO MÉTODO: Permite al repositorio encontrar al usuario sin importar su estado de actividad
  async buscarPorIdAdministrativo(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

}