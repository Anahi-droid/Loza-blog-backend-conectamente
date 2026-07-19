import { Controller, Get, Post, Body, Param, Req, UseGuards, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import type { EstadoCita } from './cita.entity'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('citas')
@ApiBearerAuth()  
@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  // 🚀 GET /citas - Lista las citas según el rol autenticado
  @Get()
  @ApiOperation({ summary: 'Obtener todas las citas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Listado de citas obtenido con éxito.' })
  async obtenerMisCitas(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.citasService.obtenerCitas(usuarioId, rol);
  }

  // 🚀 POST /citas - Crea una cita (Soporta pacienteId opcional enviado por el profesional)
  @Post()
  @ApiOperation({ summary: 'Reservar una nueva cita médica' })
  @ApiResponse({ status: 201, description: 'La cita ha sido agendada con éxito.' })
  async reservarCita(
    @Req() req,
    @Body() createCitaDto: CreateCitaDto, 
  ) {
    const esProfesional = req.user.rol === 'ADMIN' || req.user.rol === 'PSICOLOGO';
    const pacienteId = esProfesional && createCitaDto.pacienteId 
      ? createCitaDto.pacienteId 
      : req.user.id;

    return this.citasService.agendarCita(pacienteId, createCitaDto.agendaId, createCitaDto.motivoConsulta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una cita específica por su UUID' })
  async obtenerCita(@Param('id') id: string, @Req() req) {
    return this.citasService.obtenerCitaPorId(id, req.user.id, req.user.rol);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar estado o notas de una cita' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string', example: 'REALIZADA', enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REALIZADA'] },
        notasNotasMedicas: { type: 'string', example: 'El paciente muestra evolución favorable.' }
      }
    }
  })
  async actualizarCita(
    @Param('id') id: string,
    @Req() req,
    @Body('estado') estado?: EstadoCita,
    @Body('notasNotasMedicas') notasMedicas?: string,
  ) {
    return this.citasService.actualizarCita(id, req.user.id, req.user.rol, estado, notasMedicas);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar una cita médica y liberar el horario asignado' })
  async eliminarCita(@Param('id') id: string, @Req() req) {
    return this.citasService.eliminarCita(id, req.user.id, req.user.rol);
  }

  // 🚀 NUEVO ENDPOINT: Actualizar el estado de un pago específico
  @Patch('pagos/:pagoId')
  @ApiOperation({ summary: 'Actualizar el estado transaccional de un pago (Ej: PAGADO)' })
  @ApiResponse({ status: 200, description: 'Estado del pago actualizado con éxito.' })
  async actualizarEstadoPago(
    @Param('pagoId') pagoId: string,
    @Body('estado') estado: string,
  ) {
    return this.citasService.actualizarEstadoPago(pagoId, estado);
  }

}