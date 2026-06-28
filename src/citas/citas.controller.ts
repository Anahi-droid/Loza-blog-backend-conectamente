import { Controller, Get, Post, Body, Param, Req, UseGuards, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import type { EstadoCita } from './cita.entity'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('citas')
@ApiBearerAuth()  
@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @ApiOperation({ summary: 'Reservar una nueva cita médica (Solo PACIENTES)' })
  @ApiResponse({ status: 201, description: 'La cita ha sido agendada con éxito y se generaron sus registros de pago y sesión hilos.' })
  @ApiResponse({ status: 400, description: 'Error de validación en el JSON enviado o el horario ya está reservado.' })
  @ApiResponse({ status: 404, description: 'El bloque de agenda solicitado no existe.' })
  async reservarCita(
    @Req() req,
    @Body() createCitaDto: CreateCitaDto, 
  ) {
    const pacienteId = req.user.id; 
    return this.citasService.agendarCita(pacienteId, createCitaDto.agendaId, createCitaDto.motivoConsulta);
  }

  @Get('mis-citas')
  @ApiOperation({ summary: 'Obtener el historial de citas del usuario autenticado (Filtra dinámicamente por rol PACIENTE o PSICOLOGO)' })
  @ApiResponse({ status: 200, description: 'Lista de citas ordenada de forma descendente por fecha y hora.' })
  async listarMisCitas(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol; 
    return this.citasService.listarMisCitas(usuarioId, rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle completo de una cita específica por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cita médica a consultar', example: 'f3b8c2d9-14ba-4c36-8924-cd7dae9ab613' })
  @ApiResponse({ status: 200, description: 'Objeto detallado de la cita con relaciones limpias.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos (Forbidden) para ver una cita que no te pertenece.' })
  @ApiResponse({ status: 404, description: 'La cita solicitada no existe en la base de datos.' })
  async obtenerPorId(@Param('id') id: string, @Req() req) {
    return this.citasService.obtenerCitaPorId(id, req.user.id, req.user.rol);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar el estado o añadir notas médicas a una cita (Uso principal del PSICOLOGO)' })
  @ApiParam({ name: 'id', description: 'UUID de la cita a modificar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string', example: 'REALIZADA', enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REALIZADA'] },
        notasNotasMedicas: { type: 'string', example: 'El paciente muestra evolución favorable en las estrategias de afrontamiento.' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Registro de la cita actualizado correctamente en PostgreSQL.' })
  @ApiResponse({ status: 404, description: 'La cita médica no existe.' })
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
  @ApiOperation({ summary: 'Cancelar una cita médica y liberar el horario asignado en la agenda profesional' })
  @ApiParam({ name: 'id', description: 'UUID de la cita que se desea remover' })
  @ApiResponse({ status: 200, description: 'La cita ha sido cancelada y el horario de agenda se liberó con éxito.' })
  @ApiResponse({ status: 403, description: 'No posees autorización para cancelar una cita ajena.' })
  async eliminarCita(@Param('id') id: string, @Req() req) {
    await this.citasService.eliminarCita(id, req.user.id, req.user.rol);
    return { message: 'La cita ha sido cancelada y el horario de agenda se liberó con éxito.' };
  }
}