import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  // 🚪 1. El Paciente envía una solicitud a un psicólogo desde el Login/Catálogo público
  @Post('enviar')
  async enviarSolicitud(
    @Req() req: any,
    @Body('psicologoId', ParseUUIDPipe) psicologoId: string,
    @Body('mensajeInicial') mensaje?: string,
  ) {
    // req.user.id extrae automáticamente el ID del paciente logueado desde su JWT token
    return await this.solicitudesService.enviarSolicitud(req.user.id, psicologoId, mensaje);
  }

  // 🩺 2. El Psicólogo consulta las solicitudes PENDIENTES que han llegado exclusivamente a su perfil
  @Get('bandeja')
  async listarMisSolicitudes(@Req() req: any) {
    // Usamos el id de usuario o el psicologoId inyectado en el login del auth service
    const psicologoId = req.user.psicologoId;
    return await this.solicitudesService.listarParaPsicologo(psicologoId);
  }

  // 🛠️ 3. El Psicólogo ACEPTA o RECHAZA una solicitud específica
  @Patch(':id/procesar')
  async procesarSolicitud(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estado') estado: 'ACEPTADA' | 'RECHAZADA',
  ) {
    return await this.solicitudesService.procesarSolicitud(id, estado);
  }
}