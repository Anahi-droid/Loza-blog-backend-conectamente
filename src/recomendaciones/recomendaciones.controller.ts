import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacione.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly recomendacionesService: RecomendacionesService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Req() req, @Body() createRecomendacionDto: CreateRecomendacionDto) {
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.recomendacionesService.create(createRecomendacionDto, psicologoId);
  }

  @Get()
  findAll() {
    return this.recomendacionesService.findAll();
  }

  @Get('progresos/todos')
  findAllProgresos() {
    return this.recomendacionesService.findAllProgresos();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findOne(id);
  }

  @Get('paciente/:id')
  findByPaciente(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findByPaciente(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecomendacionDto: UpdateRecomendacionDto,
  ) {
    return this.recomendacionesService.update(id, updateRecomendacionDto);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.remove(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Post('progresos')
  createProgreso(
    @Body('historialId', ParseUUIDPipe) historialId: string,
    @Body('fecha') fecha: string,
    @Body('estadoEmocional') estadoEmocional: string,
    @Body('avance') avance: string,
    @Body('observaciones') observaciones: string,
  ) {
    return this.recomendacionesService.createProgreso(historialId, new Date(fecha), estadoEmocional, avance, observaciones);
  }

  @Get('progresos/:id')
  findOneProgreso(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findOneProgreso(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Patch('progresos/:id')
  updateProgreso(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estadoEmocional') estadoEmocional?: string,
    @Body('avance') avance?: string,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.recomendacionesService.updateProgreso(id, estadoEmocional, avance, observaciones);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete('progresos/:id')
  removeProgreso(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.removeProgreso(id);
  }
}