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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ── Utilidad interna ──────────────────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // ── Escritura ─────────────────────────────────────────────────────────────

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
    const usuario = this.usuarioRepo.create({ ...dto, password: passwordHash });
    return this.usuarioRepo.save(usuario);
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
    const usuario = await this.buscarPorId(id);
    usuario.activo = false;
    await this.usuarioRepo.save(usuario);
  }

  // ── Lectura ───────────────────────────────────────────────────────────────

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ where: { email, activo: true } });
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
    const query = this.usuarioRepo.createQueryBuilder('u');

    if (rol) {
      query.where('u.rol = :rol', { rol });
    }

    const [data, total] = await query
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { data, total, pagina, limite };
  }
}