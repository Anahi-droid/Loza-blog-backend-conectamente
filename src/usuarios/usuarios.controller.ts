import { Controller, Get, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from '../usuarios/usuario.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('usuarios')
@UseGuards(JwtAuthGuard) 
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  
  @Get('perfil')
  obtenerPerfil(@Req() req) {
    return this.usuariosService.buscarPorId(req.user.id);
  }

  
  @Patch('perfil')
  actualizarPerfil(@Req() req, @Body() datosActualizar: Partial<Usuario>) {
    return this.usuariosService.actualizarPerfil(req.user.id, datosActualizar);
  }
}