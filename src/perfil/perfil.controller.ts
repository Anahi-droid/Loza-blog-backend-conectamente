import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfilService } from './perfil.service';
import { UpdatePerfilDto, CreatePerfilDto } from './dto/update-perfil.dto';
import { UsuarioAutenticado } from './perfil.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

interface RequestConUsuario extends Request {
  user: UsuarioAutenticado;
}

@ApiTags('perfil')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @ApiOperation({ summary: 'Obtener mi perfil (extraído del JWT)' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado' })
  @Get()
  async obtenerPerfil(@Request() req: RequestConUsuario) {
    return this.perfilService.obtenerPerfil(req.user.id);
  }

  @ApiOperation({ summary: 'Obtener perfil por ID' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido por ID' })
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.perfilService.obtenerPerfil(id);
  }

  @ApiOperation({ summary: 'Crear un nuevo perfil' })
  @ApiResponse({ status: 201, description: 'Perfil creado correctamente' })
  @Post()
  async crearPerfil(@Body() dto: CreatePerfilDto) {
    return this.perfilService.crearPerfil(dto);
  }

  @ApiOperation({ summary: 'Actualizar mi perfil (nombre, apellido, password)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  @Patch()
  async actualizarPerfil(@Request() req: RequestConUsuario, @Body() dto: UpdatePerfilDto) {
    return this.perfilService.actualizarPerfil(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Eliminar mi perfil' })
  @ApiResponse({ status: 200, description: 'Perfil eliminado correctamente' })
  @Delete()
  async eliminarPerfil(@Request() req: RequestConUsuario) {
    return this.perfilService.eliminarPerfil(req.user.id);
  }
}