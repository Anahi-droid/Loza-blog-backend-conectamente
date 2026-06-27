import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto'; 
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@ApiTags('especialidades')
@ApiBearerAuth('jwt-auth') 
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  @ApiOperation({ summary: 'Crear una nueva especialidad (Solo ADMIN)' })
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadesService.create(createEspecialidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las especialidades disponibles' })
  findAll() {
    return this.especialidadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una especialidad por ID' })
  findOne(@Param('id') id: string) {
    return this.especialidadesService.findOne(id);
  }
}