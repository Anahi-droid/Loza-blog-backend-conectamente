import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { CreateProgresoDto } from './dto/create-progreso.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('progreso')
@ApiBearerAuth('jwt-auth')
@Controller('progreso')
@UseGuards(JwtAuthGuard)
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo hito de progreso' })
  create(@Body() createProgresoDto: CreateProgresoDto) {
    return this.progresoService.create(createProgresoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de progreso' })
  findAll() {
    return this.progresoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de progreso por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.progresoService.findOne(id);
  }

  @Get('paciente/:id')
  @ApiOperation({ summary: 'Obtener el progreso de un paciente específico' })
  findByPaciente(@Param('id', ParseUUIDPipe) id: string) {
    return this.progresoService.findByPaciente(id);
  }

  @Get('metricas/generales')
  @ApiOperation({ summary: 'Obtener métricas generales de progreso (Admin/Psicólogo)' })
  async obtenerMetricasGenerales(@Req() req) {
    if (req.user.rol !== 'ADMIN' && req.user.rol !== 'PSICOLOGO') {
      throw new ForbiddenException('No tienes permisos para ver estas métricas.');
    }
    return this.progresoService.obtenerMetricasGenerales();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de progreso' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProgresoDto: UpdateProgresoDto
  ) {
    return this.progresoService.update(id, updateProgresoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de progreso' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.progresoService.remove(id);
  }
}
