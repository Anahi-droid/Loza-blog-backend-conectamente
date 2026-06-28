import { Controller, Get, Post, Body, Param, Req, UseGuards, Patch, Delete } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { EstadoCita } from './cita.entity'; 

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

  @Get(':id')
  async obtenerPorId(@Param('id') id: string, @Req() req) {
    return this.citasService.obtenerCitaPorId(id, req.user.id, req.user.rol);
  }

  @Patch(':id')
  async actualizarCita(
    @Param('id') id: string,
    @Req() req,
    @Body('estado') estado?: EstadoCita,
    @Body('notasNotasMedicas') notasMedicas?: string,
  ) {
    return this.citasService.actualizarCita(id, req.user.id, req.user.rol, estado, notasMedicas);
  }

  @Delete(':id')
  async eliminarCita(@Param('id') id: string, @Req() req) {
    await this.citasService.eliminarCita(id, req.user.id, req.user.rol);
    return { message: 'La cita ha sido cancelada y el horario de agenda se liberó con éxito.' };
  }
}