import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('historiales')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Req() req, @Body() createHistorialDto: CreateHistorialDto) {
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.historialService.create(createHistorialDto, psicologoId);
  }

  @Get()
  findAll() {
    return this.historialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.historialService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateHistorialDto: UpdateHistorialDto) {
    return this.historialService.update(id, updateHistorialDto);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.historialService.remove(id);
  }

  @Get('diagnosticos/todos')
  findAllDiagnosticos() {
    return this.historialService.findAllDiagnosticos();
  }

  @UseGuards(JwtAuthGuard) 
  @Post('diagnosticos')
  createDiagnostico(
    @Body('historialId', ParseUUIDPipe) historialId: string,
    @Body('codigoCIE10') codigoCIE10: string,
    @Body('descripcion') descripcion: string,
  ) {
    return this.historialService.createDiagnostico(historialId, codigoCIE10, descripcion);
  }

  @Get('diagnosticos/:id')
  findOneDiagnostico(@Param('id', ParseUUIDPipe) id: string) {
    return this.historialService.findOneDiagnostico(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Patch('diagnosticos/:id')
  updateDiagnostico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('codigoCIE10') codigoCIE10?: string,
    @Body('descripcion') descripcion?: string,
  ) {
    return this.historialService.updateDiagnostico(id, codigoCIE10, descripcion);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete('diagnosticos/:id')
  removeDiagnostico(@Param('id', ParseUUIDPipe) id: string) {
    return this.historialService.removeDiagnostico(id);
  }
}