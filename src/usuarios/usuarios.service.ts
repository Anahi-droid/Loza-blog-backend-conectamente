import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Rol } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  
  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['perfilPsicologo'], 
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    
    delete usuario.password;
    return usuario;
  }

  
  async buscarPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado.`);
    }
    return usuario;
  }

  
  async listarPorRol(rol: Rol): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      where: { rol, activo: true },
      order: { nombre: 'ASC' },
    });
  }

  
  async actualizarPerfil(id: string, datosActualizar: Partial<Usuario>): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);

    
    if (datosActualizar.rol || datosActualizar.email) {
      throw new BadRequestException('No puedes modificar el rol o el email desde este endpoint.');
    }

    
    const usuarioEditado = this.usuarioRepository.merge(usuario, datosActualizar);
    return await this.usuarioRepository.save(usuarioEditado);
  }

  
  async desactivarUsuario(id: string): Promise<{ mensaje: string }> {
    const usuario = await this.buscarPorId(id);
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
    return { mensaje: 'Usuario desactivado correctamente.' };
  }
}