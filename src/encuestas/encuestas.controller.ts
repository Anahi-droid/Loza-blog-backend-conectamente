import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EncuestasService } from './encuestas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { CreateEncuestaDto } from './dto/create-encuesta.dto';
import { CreateRespuestaDto } from './dto/create-respuesta.dto';
import { UpdateEncuestaDto } from './dto/update-encuesta.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una encuesta por ID' })
  findOne(@Param('id') id: string) {
    return this.encuestasService.findOne(id);
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

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una encuesta por ID' })
  update(@Param('id') id: string, @Body() updateDto: UpdateEncuestaDto) {
    return this.encuestasService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una encuesta por ID' })
  remove(@Param('id') id: string) {
    return this.encuestasService.remove(id);
  }

  @Get(':id/respuestas')
  @ApiOperation({ summary: 'Obtener los resultados de respuestas de una encuesta específica' })
  obtenerRespuestasPorEncuesta(@Param('id') encuestaId: string) {
    return this.encuestasService.obtenerRespuestasPorEncuesta(encuestaId);
  }
}