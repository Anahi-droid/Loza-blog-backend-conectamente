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


import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('perfil')
@ApiBearerAuth('jwt-auth')   // ← debe coincidir con el nombre del esquema en main.ts
@UseGuards(JwtAuthGuard)
@Controller('perfil')
export class PerfilController {

  @ApiOperation({ summary: 'Obtener mi perfil (extraído del JWT)' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado' })
  @Get()
  obtenerPerfil(@Request() req) { ... }

  @ApiOperation({ summary: 'Actualizar mi perfil (nombre, apellido, password)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @Patch()
  actualizarPerfil(@Request() req, @Body() dto: UpdatePerfilDto) { ... }
}