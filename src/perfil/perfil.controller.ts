import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfilService } from './perfil.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UsuarioAutenticado } from './perfil.entity';

// request.user es inyectado por JwtStrategy.validate()
interface RequestConUsuario extends Request {
  user: UsuarioAutenticado;
}

@Controller('perfil')
@UseGuards(JwtAuthGuard) // Protege todo el controlador
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  obtenerPerfil(@Request() req: RequestConUsuario) {
    // El ID siempre viene del JWT — nunca del body/params
    return this.perfilService.obtenerPerfil(req.user.id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  actualizarPerfil(
    @Request() req: RequestConUsuario,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.perfilService.actualizarPerfil(req.user.id, dto);
  }
}