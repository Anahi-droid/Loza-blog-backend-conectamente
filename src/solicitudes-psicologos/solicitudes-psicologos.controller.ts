import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SolicitudesPsicologosService } from './solicitudes-psicologos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('solicitudes-psicologos')
export class SolicitudesPsicologosController {
  constructor(private readonly solicitudesPsicologosService: SolicitudesPsicologosService) {}

  // 🌐 PÚBLICO: Cualquier psicólogo se postula desde /register-psicologo
  @Post()
  async crearSolicitud(@Body() datos: any) {
    return await this.solicitudesPsicologosService.crearSolicitud(datos);
  }

  // 🔒 PRIVADO (ADMIN): Obtener listado de postulaciones
  @UseGuards(JwtAuthGuard)
  @Get()
  async obtenerTodas() {
    return await this.solicitudesPsicologosService.obtenerTodas();
  }

  // 🔒 PRIVADO (ADMIN): Aprobar solicitud
  @UseGuards(JwtAuthGuard)
  @Patch(':id/aprobar')
  async aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminObservaciones') adminObservaciones?: string,
  ) {
    return await this.solicitudesPsicologosService.aprobar(id, adminObservaciones);
  }

  // 🔒 PRIVADO (ADMIN): Rechazar solicitud
  @UseGuards(JwtAuthGuard)
  @Patch(':id/rechazar')
  async rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminObservaciones') adminObservaciones?: string,
  ) {
    return await this.solicitudesPsicologosService.rechazar(id, adminObservaciones);
  }
}