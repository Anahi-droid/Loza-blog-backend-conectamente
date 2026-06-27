import { Controller, Get, Post, Body, Param, Req, UseGuards, BadRequestException, Patch, Delete } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async actualizarHorario(
    @Param('id') agendaId: string,
    @Req() req,
    @Body('fechaHoraInicio') nuevaFecha?: string,
    @Body('estaReservado') estaReservado?: boolean,
  ) {
    const psicologoId = req.user.psicologoId;
    
    return this.agendasService.actualizarDisponibilidad(
      agendaId, 
      psicologoId, 
      nuevaFecha ? new Date(nuevaFecha) : undefined, 
      estaReservado
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminarHorario(@Param('id') agendaId: string, @Req() req) {
    const psicologoId = req.user.psicologoId;
    
    await this.agendasService.eliminarDisponibilidad(agendaId, psicologoId);
    return { message: 'Bloque de disponibilidad eliminado correctamente.' };
  }

}