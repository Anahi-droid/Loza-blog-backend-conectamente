import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UpdatePerfilDto, CreatePerfilDto } from './dto/update-perfil.dto';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class PerfilService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async obtenerPerfil(usuarioId: string): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    const { password, ...perfil } = usuario;
    return perfil;
  }

  async crearPerfil(dto: CreatePerfilDto): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosService.crear(dto);
    const { password, ...perfil } = usuario;
    return perfil;
  }

  async actualizarPerfil(
    usuarioId: string,
    dto: UpdatePerfilDto,
  ): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosService.actualizar(usuarioId, dto);
    const { password, ...perfil } = usuario;
    return perfil;
  }

  async eliminarPerfil(usuarioId: string): Promise<void> {
    await this.usuariosService.desactivar(usuarioId);
  }
}