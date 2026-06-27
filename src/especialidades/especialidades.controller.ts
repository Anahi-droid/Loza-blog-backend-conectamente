import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto'; 
import { UpdateEspecialidadeDto } from './dto/update-especialidade.dto';

@ApiTags('especialidades')
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly tableEspecialidadesService: EspecialidadesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva especialidad (PÚBLICO PARA TEST)' })
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.tableEspecialidadesService.create(createEspecialidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las especialidades disponibles' })
  findAll() {
    return this.tableEspecialidadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una especialidad por ID' })
  findOne(@Param('id') id: string) {
    return this.tableEspecialidadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una especialidad por ID' })
  update(@Param('id') id: string, @Body() updateEspecialidadeDto: UpdateEspecialidadeDto) {
    return this.tableEspecialidadesService.update(id, updateEspecialidadeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una especialidad por ID' })
  remove(@Param('id') id: string) {
    return this.tableEspecialidadesService.remove(id);
  }
}