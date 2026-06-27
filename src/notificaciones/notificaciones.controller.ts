import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacione.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
@ApiTags('notificaciones')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard) 
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear y enviar una nueva notificación' })
  create(@Body() createNotificacionDto: CreateNotificacionDto) {
    return this.notificacionesService.create(createNotificacionDto);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener todas las notificaciones de un usuario' })
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.notificacionesService.findByUsuario(usuarioId);
  }

  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id);
  }
}