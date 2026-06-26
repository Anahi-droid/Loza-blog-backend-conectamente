import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateStaffDto } from './dto/create-admin.dto';
import { FiltrosUsuario } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async crearStaff(dto: CreateStaffDto) {
    const usuario = await this.usuariosService.crear(dto);
    const { password, ...resultado } = usuario;
    return resultado;
  }

  async listarUsuarios(filtros: FiltrosUsuario) {
    const { pagina = 1, limite = 10, rol } = filtros;
    return this.usuariosService.listarTodos(pagina, limite, rol);
  }

  async darDeBaja(id: string): Promise<{ mensaje: string }> {
    await this.usuariosService.desactivar(id);
    return { mensaje: `Usuario ${id} desactivado correctamente` };
  }
}