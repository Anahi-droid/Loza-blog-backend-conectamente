import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  async reservarCita(
    @Req() req,
    @Body('agendaId') agendaId: string,
    @Body('motivoConsulta') motivoConsulta: string,
  ) {
    const pacienteId = req.user.id; 
    return this.citasService.agendarCita(pacienteId, agendaId, motivoConsulta);
  }

  @Get('mis-citas')
  async listarMisCitas(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol; 
    return this.citasService.listarMisCitas(usuarioId, rol);
  }
}