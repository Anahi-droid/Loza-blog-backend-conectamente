import { Controller, Get, Post, Body, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AgendasService } from './agenda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agendas')
export class AgendasController {
  constructor(private readonly agendasService: AgendasService) {}
  
  @UseGuards(JwtAuthGuard)
  @Post()
  async crearHorario(@Req() req, @Body('fechaHoraInicio') fechaHoraInicio: string) {
    const psicologoId = req.user.psicologoId;    
    
    if (!psicologoId) {
      throw new BadRequestException('El token no contiene un identificador válido de perfil profesional.');
    }

    return this.agendasService.crearDisponibilidad(psicologoId, new Date(fechaHoraInicio));
  }

  @Get('psicologo/:id')
  obtenerDisponibles(@Param('id') psicologoId: string) {
    return this.agendasService.obtenerDisponiblesPorPsicologo(psicologoId);
  }
}