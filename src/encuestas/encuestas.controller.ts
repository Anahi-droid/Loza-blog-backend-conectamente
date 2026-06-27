import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EncuestasService } from './encuestas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { CreateEncuestaDto } from './dto/create-encuesta.dto';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';

@ApiTags('encuestas')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard) 
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva plantilla de encuesta con preguntas dinámicas' })
  create(@Body() createEncuestaDto: CreateEncuestaDto) {
    return this.encuestasService.create(createEncuestaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las encuestas disponibles' })
  findAll() {
    return this.encuestasService.findAll();
  }

  @Post(':id/responder')
  @ApiOperation({ summary: 'Guardar las respuestas de un paciente para una encuesta' })
  guardarRespuesta(
    @Param('id') encuestaId: string,
    @Body() createRespuestaDto: CreateRespuestaDto,
  ) {
    const { usuarioId, respuestas } = createRespuestaDto;
    return this.encuestasService.guardarRespuesta(encuestaId, usuarioId, respuestas);
  }

  @Get(':id/respuestas')
  @ApiOperation({ summary: 'Obtener los resultados de respuestas de una encuesta específica' })
  obtenerRespuestasPorEncuesta(@Param('id') encuestaId: string) {
    return this.encuestasService.obtenerRespuestasPorEncuesta(encuestaId);
  }
}