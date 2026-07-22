import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EncuestasService } from './encuestas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { CreateEncuestaDto } from './dto/create-encuesta.dto';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';
import { UpdateEncuestaDto } from './dto/update-encuesta.dto';
import { AsignarEncuestaDto } from './dto/asignar-encuesta.dto';

@ApiTags('encuestas')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard) 
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva plantilla de encuesta' })
  create(@Req() req, @Body() createEncuestaDto: CreateEncuestaDto) {
    const psicologoId = req.user.id;
    return this.encuestasService.create(createEncuestaDto, psicologoId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener encuestas privadas por rol' })
  findAll(@Req() req) {
    return this.encuestasService.findAllPorRol(req.user.id, req.user.rol);
  }

  @Get('mis-encuestas')
  @ApiOperation({ summary: 'Obtener encuestas asignadas al paciente autenticado' })
  obtenerMisEncuestas(@Req() req) {
    const pacienteId = req.user.id;
    return this.encuestasService.obtenerMisEncuestasAsignadas(pacienteId);
  }

  @Get('mis-respuestas')
  @ApiOperation({ summary: 'Obtener las respuestas del paciente autenticado' })
  async obtenerMisRespuestas(@Req() req) {
    return this.encuestasService.obtenerMisRespuestas(req.user.id);
  }

  @Get('metricas/generales')
  @ApiOperation({ summary: 'Obtener métricas generales de encuestas' })
  async obtenerMetricasGenerales(@Req() req) {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'PSICOLOGO') {
      throw new ForbiddenException('No tienes permisos para ver estas métricas.');
    }
    return this.encuestasService.obtenerMetricasGeneralesPorRol(req.user.id, req.user.rol);
  }

  @Get(':id/respuestas')
  @ApiOperation({ summary: 'Obtener respuestas de una encuesta' })
  obtenerRespuestasPorEncuesta(@Param('id') encuestaId: string, @Req() req) {
    return this.encuestasService.obtenerRespuestasPorEncuesta(encuestaId, req.user.id, req.user.rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una encuesta por ID' })
  findOne(@Param('id') id: string) {
    return this.encuestasService.findOne(id);
  }

  @Post(':id/responder')
  @ApiOperation({ summary: 'Guardar las respuestas de un paciente' })
  guardarRespuesta(
    @Param('id') encuestaId: string,
    @Req() req,
    @Body() createRespuestaDto: CreateRespuestaDto,
  ) {
    const usuarioId = req.user.id;
    return this.encuestasService.guardarRespuesta(encuestaId, usuarioId, createRespuestaDto.respuestas);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una encuesta por ID' })
  update(@Param('id') id: string, @Req() req, @Body() updateDto: UpdateEncuestaDto) {
    return this.encuestasService.update(id, updateDto, req.user.id, req.user.rol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una encuesta por ID' })
  remove(@Param('id') id: string, @Req() req) {
    return this.encuestasService.remove(id, req.user.id, req.user.rol);
  }

  @Post(':id/asignar')
  @ApiOperation({ summary: 'Asignar una encuesta a un paciente' })
  asignarEncuesta(@Param('id') encuestaId: string, @Req() req, @Body() asignarEncuestaDto: AsignarEncuestaDto) {
    const psicologoId = req.user.id;
    return this.encuestasService.asignarEncuesta(encuestaId, psicologoId, asignarEncuestaDto.pacienteId);
  }

  @Get('mis-asignadas')
  @ApiOperation({ summary: 'Obtener encuestas asignadas por el psicólogo autenticado' })
  obtenerMisEncuestasAsignadas(@Req() req) {
    return this.encuestasService.obtenerEncuestasAsignadas(req.user.id);
  }
}