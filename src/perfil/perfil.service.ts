import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class PerfilService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async obtenerPerfil(usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    
    // 1. Validamos primero si existe. Si es null, lanza la excepción correcta.
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Si pasa la validación, desestructuramos de forma segura.
    const { password, ...perfil } = usuario;
    return perfil;
  }

  async actualizarPerfil(usuarioId: string, dto: any) {
    const usuarioActualizado = await this.usuariosService.actualizar(usuarioId, dto);
    
    if (!usuarioActualizado) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...perfil } = usuarioActualizado;
    return perfil;
  }
}